import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../constants/app_constants.dart';
import '../constants/api_constants.dart';
import '../models/user_model.dart';
import '../utils/utils.dart';
import 'api_service.dart';

class UserService {
  final ApiService _apiService = ApiService();

  // Singleton pattern
  static final UserService _instance = UserService._internal();
  factory UserService() => _instance;
  UserService._internal();

  // Get user profile
  Future<User> getUserProfile() async {
    try {
      final response = await _apiService.get(ApiConstants.userProfileEndpoint);
      final user = User.fromJson(response['user']);

      // Update locally stored user data
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConstants.userKey, json.encode(user.toJson()));

      return user;
    } catch (e) {
      debugPrint('Get user profile error: $e');
      rethrow;
    }
  }

  // Update user profile
  Future<User> updateUserProfile(String username, String email) async {
    try {
      final response = await _apiService.put(ApiConstants.userProfileEndpoint, {
        'username': username,
        'email': email,
      });

      final user = User.fromJson(response['user']);

      // Update locally stored user data
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConstants.userKey, json.encode(user.toJson()));

      Utils.showToast('Profile updated successfully');
      return user;
    } catch (e) {
      debugPrint('Update user profile error: $e');
      Utils.showToast('Failed to update profile', isError: true);
      rethrow;
    }
  }

  // Change password
  Future<bool> changePassword(
    String currentPassword,
    String newPassword,
  ) async {
    try {
      await _apiService.post(ApiConstants.changePasswordEndpoint, {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      });

      Utils.showToast('Password changed successfully');
      return true;
    } catch (e) {
      debugPrint('Change password error: $e');
      Utils.showToast('Failed to change password', isError: true);
      return false;
    }
  }

  // Get user wallet transactions with pagination
  Future<Map<String, dynamic>> getWalletTransactions({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await _apiService.get(
        '${ApiConstants.walletTransactionsEndpoint}?page=$page&limit=$limit',
      );

      return response;
    } catch (e) {
      debugPrint('Get wallet transactions error: $e');
      rethrow;
    }
  }

  // Get user game selections with pagination
  Future<Map<String, dynamic>> getUserSelections({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await _apiService.get(
        '${ApiConstants.userSelectionsEndpoint}?page=$page&limit=$limit',
      );

      return response;
    } catch (e) {
      debugPrint('Get user selections error: $e');
      rethrow;
    }
  }

  // Get user game results with pagination
  Future<Map<String, dynamic>> getUserResults({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await _apiService.get(
        '${ApiConstants.userResultsEndpoint}?page=$page&limit=$limit',
      );

      return response;
    } catch (e) {
      debugPrint('Get user results error: $e');
      rethrow;
    }
  }

  // Get user statistics
  Future<Map<String, dynamic>> getUserStats() async {
    try {
      final response = await _apiService.get(ApiConstants.userStatsEndpoint);
      return response;
    } catch (e) {
      debugPrint('Get user stats error: $e');
      rethrow;
    }
  }
}
