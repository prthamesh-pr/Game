import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';
import '../utils/exceptions.dart';

class ApiService {
  final String baseUrl = ApiConstants.baseUrl;

  // Singleton pattern
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  // Headers with authentication
  Future<Map<String, String>> _getHeaders({bool requireAuth = true}) async {
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (requireAuth) {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(ApiConstants.tokenKey);

      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      } else {
        throw UnauthorizedException('No authentication token found');
      }
    }

    return headers;
  }

  // HTTP GET request
  Future<dynamic> get(String endpoint, {bool requireAuth = true}) async {
    try {
      final headers = await _getHeaders(requireAuth: requireAuth);
      final response = await http
          .get(Uri.parse('$baseUrl$endpoint'), headers: headers)
          .timeout(const Duration(seconds: 10));

      return _handleResponse(response);
    } on SocketException {
      throw FetchDataException('No Internet connection');
    } on HttpException {
      throw BadRequestException('Failed to process the request');
    } catch (e) {
      if (e is UnauthorizedException) rethrow;
      throw FetchDataException('Error: ${e.toString()}');
    }
  }

  // HTTP POST request
  Future<dynamic> post(
    String endpoint,
    dynamic body, {
    bool requireAuth = true,
  }) async {
    try {
      final headers = await _getHeaders(requireAuth: requireAuth);
      final response = await http
          .post(
            Uri.parse('$baseUrl$endpoint'),
            headers: headers,
            body: json.encode(body),
          )
          .timeout(const Duration(seconds: 15));

      return _handleResponse(response);
    } on SocketException {
      throw FetchDataException('No Internet connection');
    } on HttpException {
      throw BadRequestException('Failed to process the request');
    } catch (e) {
      if (e is UnauthorizedException) rethrow;
      throw FetchDataException('Error: ${e.toString()}');
    }
  }

  // HTTP PUT request
  Future<dynamic> put(
    String endpoint,
    dynamic body, {
    bool requireAuth = true,
  }) async {
    try {
      final headers = await _getHeaders(requireAuth: requireAuth);
      final response = await http
          .put(
            Uri.parse('$baseUrl$endpoint'),
            headers: headers,
            body: json.encode(body),
          )
          .timeout(const Duration(seconds: 15));

      return _handleResponse(response);
    } on SocketException {
      throw FetchDataException('No Internet connection');
    } on HttpException {
      throw BadRequestException('Failed to process the request');
    } catch (e) {
      if (e is UnauthorizedException) rethrow;
      throw FetchDataException('Error: ${e.toString()}');
    }
  }

  // HTTP DELETE request
  Future<dynamic> delete(String endpoint, {bool requireAuth = true}) async {
    try {
      final headers = await _getHeaders(requireAuth: requireAuth);
      final response = await http
          .delete(Uri.parse('$baseUrl$endpoint'), headers: headers)
          .timeout(const Duration(seconds: 10));

      return _handleResponse(response);
    } on SocketException {
      throw FetchDataException('No Internet connection');
    } on HttpException {
      throw BadRequestException('Failed to process the request');
    } catch (e) {
      if (e is UnauthorizedException) rethrow;
      throw FetchDataException('Error: ${e.toString()}');
    }
  }

  // Handle HTTP response
  dynamic _handleResponse(http.Response response) {
    switch (response.statusCode) {
      case 200:
      case 201:
        return json.decode(response.body);
      case 400:
        throw BadRequestException(response.body);
      case 401:
      case 403:
        throw UnauthorizedException(response.body);
      case 404:
        throw NotFoundException(response.body);
      case 429:
        throw TooManyRequestsException(response.body);
      case 500:
      default:
        throw ServerException('Server error: ${response.statusCode}');
    }
  }

  // Method to refresh token
  Future<bool> refreshToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final refreshToken = prefs.getString(ApiConstants.refreshTokenKey);

      if (refreshToken == null || refreshToken.isEmpty) {
        return false;
      }

      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/refresh'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'refreshToken': refreshToken}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await prefs.setString(ApiConstants.tokenKey, data['token']);
        await prefs.setString(
          ApiConstants.refreshTokenKey,
          data['refreshToken'],
        );
        return true;
      } else {
        // Clear tokens if refresh fails
        await prefs.remove(ApiConstants.tokenKey);
        await prefs.remove(ApiConstants.refreshTokenKey);
        return false;
      }
    } catch (e) {
      debugPrint('Token refresh error: $e');
      return false;
    }
  }
}
