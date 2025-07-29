import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../constants/app_constants.dart';
import '../constants/api_constants.dart';
import '../models/user_model.dart';
import '../utils/exceptions.dart';
import '../utils/utils.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _apiService = ApiService();

  // Singleton pattern
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  // Login user
  Future<User> login(String identifier, String password) async {
    try {
      // Accept username or phoneNumber for login
      final isPhone = RegExp(r'^\d{10,}$').hasMatch(identifier);
      final loginData = isPhone
          ? {
              'phoneNumber': identifier,
              'password': password,
            }
          : {
              'username': identifier,
              'password': password,
            };
      final response = await _apiService.post(
        ApiConstants.loginEndpoint,
        loginData,
        requireAuth: false,
      );

      // Save auth tokens
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(ApiConstants.tokenKey, response['token']);
      await prefs.setString(
        ApiConstants.refreshTokenKey,
        response['refreshToken'],
      );
      await prefs.setBool(ApiConstants.isLoggedInKey, true);

      // Parse and save user data
      final user = User.fromJson(response['user']);
      await prefs.setString(AppConstants.userKey, json.encode(user.toJson()));

      Utils.showToast(AppConstants.loginSuccess);
      return user;
    } catch (e) {
      debugPrint('Login error: $e');
      Utils.showToast(
        e is UnauthorizedException
            ? 'Invalid email or password'
            : 'Login failed: ${e.toString()}',
        isError: true,
      );
      rethrow;
    }
  }

  // Register user
  Future<User> register(
    String username,
    String email,
    String password, [
    String? mobileNumber,
    String? referral,
  ]) async {
    try {
      final Map<String, dynamic> requestData = {
        'username': username,
        'email': email,
        'password': password,
      };

      // Add mobile number if provided
      if (mobileNumber != null && mobileNumber.isNotEmpty) {
        requestData['mobileNumber'] = mobileNumber;
      }
      // Add referral if provided
      if (referral != null && referral.isNotEmpty) {
        requestData['referral'] = referral;
      }

      final response = await _apiService.post(
        ApiConstants.registerEndpoint,
        requestData,
        requireAuth: false,
      );

      // Save auth tokens
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(ApiConstants.tokenKey, response['token']);
      await prefs.setString(
        ApiConstants.refreshTokenKey,
        response['refreshToken'],
      );
      await prefs.setBool(ApiConstants.isLoggedInKey, true);

      // Parse and save user data
      final user = User.fromJson(response['user']);
      await prefs.setString(AppConstants.userKey, json.encode(user.toJson()));

      Utils.showToast('Registration successful!');
      return user;
    } catch (e) {
      debugPrint('Registration error: $e');
      Utils.showToast(
        e is BadRequestException
            ? 'Registration failed: Email may already be in use'
            : 'Registration failed: ${e.toString()}',
        isError: true,
      );
      rethrow;
    }
  }

  // Logout user
  Future<void> logout() async {
    try {
      try {
        // Try to notify server about logout
        await _apiService.post(ApiConstants.logoutEndpoint, {});
      } catch (e) {
        // Ignore errors when logging out from server
        debugPrint('Server logout error: $e');
      }

      // Clear shared preferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(ApiConstants.tokenKey);
      await prefs.remove(ApiConstants.refreshTokenKey);
      await prefs.remove(AppConstants.userKey);
      await prefs.setBool(ApiConstants.isLoggedInKey, false);
    } catch (e) {
      debugPrint('Logout error: $e');
    }
  }

  // Check if token is valid
  Future<bool> verifyToken() async {
    try {
      await _apiService.get(ApiConstants.verifyTokenEndpoint);
      return true;
    } catch (e) {
      if (e is UnauthorizedException) {
        // Try to refresh token
        final refreshed = await _apiService.refreshToken();
        if (refreshed) {
          try {
            await _apiService.get(ApiConstants.verifyTokenEndpoint);
            return true;
          } catch (_) {
            return false;
          }
        }
      }
      return false;
    }
  }

  // Load user data from shared preferences
  Future<User?> loadUserData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isLoggedIn = prefs.getBool(ApiConstants.isLoggedInKey) ?? false;

      if (isLoggedIn) {
        final userData = prefs.getString(AppConstants.userKey);
        if (userData != null && userData.isNotEmpty) {
          try {
            final userJson = json.decode(userData);
            return User.fromJson(userJson);
          } catch (e) {
            debugPrint('Error parsing user data: $e');
            // Clear corrupted data
            await _clearUserData();
            return null;
          }
        }
      }
      return null;
    } catch (e) {
      debugPrint('Error loading user data: $e');
      return null;
    }
  }

  // Check if user is logged in and token is valid
  Future<bool> isAuthenticated() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isLoggedIn = prefs.getBool(ApiConstants.isLoggedInKey) ?? false;
      final token = prefs.getString(ApiConstants.tokenKey);

      if (isLoggedIn && token != null && token.isNotEmpty) {
        return await verifyToken();
      }
      return false;
    } catch (e) {
      debugPrint('Auth check error: $e');
      return false;
    }
  }

  // Clear user data
  Future<void> _clearUserData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(ApiConstants.tokenKey);
      await prefs.remove(ApiConstants.refreshTokenKey);
      await prefs.remove(AppConstants.userKey);
      await prefs.setBool(ApiConstants.isLoggedInKey, false);
    } catch (e) {
      debugPrint('Error clearing user data: $e');
    }
  }
}
