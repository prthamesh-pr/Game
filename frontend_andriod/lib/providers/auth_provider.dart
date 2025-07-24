import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

import '../models/user_model.dart';
import '../utils/mock_data.dart';
import '../utils/utils.dart';
import '../constants/app_constants.dart';

class AuthProvider with ChangeNotifier {
  User? _currentUser;
  bool _isLoading = false;
  bool _isLoggedIn = false;
  bool _isInitialized = false;

  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isLoggedIn => _isLoggedIn;
  bool get isInitialized => _isInitialized;

  // Constructor
  AuthProvider() {
    _safeInitialize();
  }

  // Safe initialization that won't crash the app
  Future<void> _safeInitialize() async {
    try {
      // Delay initialization to avoid race conditions
      await Future.delayed(const Duration(milliseconds: 100));
      await _loadUserData();
    } catch (e) {
      debugPrint('Safe auth initialization error: $e');
    } finally {
      _isInitialized = true;
      if (!_isLoading) {
        notifyListeners();
      }
    }
  }

  // Load user data from shared preferences with robust error handling
  Future<void> _loadUserData() async {
    try {
      _isLoading = true;
      if (_isInitialized) notifyListeners();

      // Use a timeout for SharedPreferences to prevent hanging
      final prefs = await SharedPreferences.getInstance()
          .timeout(const Duration(seconds: 5));
      
      final isLoggedIn = prefs.getBool(AppConstants.isLoggedInKey) ?? false;

      if (isLoggedIn) {
        final userData = prefs.getString(AppConstants.userKey);
        if (userData != null && userData.isNotEmpty) {
          try {
            final userJson = json.decode(userData);
            _currentUser = User.fromJson(userJson);
            _isLoggedIn = true;
          } catch (e) {
            debugPrint('Error parsing user data: $e');
            // Clear corrupted data
            await _clearUserData();
          }
        }
      }
    } catch (e) {
      debugPrint('Error loading user data: $e');
      // Set safe defaults
      _isLoggedIn = false;
      _currentUser = null;
    } finally {
      _isLoading = false;
      if (_isInitialized) notifyListeners();
    }
  }

  // Clear user data safely
  Future<void> _clearUserData() async {
    try {
      final prefs = await SharedPreferences.getInstance()
          .timeout(const Duration(seconds: 5));
      await prefs.remove(AppConstants.isLoggedInKey);
      await prefs.remove(AppConstants.userKey);
      _isLoggedIn = false;
      _currentUser = null;
    } catch (e) {
      debugPrint('Error clearing user data: $e');
    }
  }

  // Login with mock user
  Future<bool> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      // Simulating API call delay
      await Future.delayed(const Duration(seconds: 2));

      // Mock validation (accept any username/password)
      if (username.isNotEmpty && password.isNotEmpty) {
        // Get mock user
        final mockUser = MockData.getMockUser();
        _currentUser = mockUser;
        _isLoggedIn = true;

        // Save to shared preferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(
          AppConstants.userKey,
          json.encode(mockUser.toJson()),
        );
        await prefs.setBool(AppConstants.isLoggedInKey, true);

        Utils.showToast(AppConstants.loginSuccess);
        return true;
      } else {
        Utils.showToast(AppConstants.loginError, isError: true);
        return false;
      }
    } catch (e) {
      debugPrint('Login error: $e');
      Utils.showToast('An error occurred', isError: true);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Login as guest
  Future<bool> loginAsGuest() async {
    _isLoading = true;
    notifyListeners();

    try {
      // Simulating API call delay
      await Future.delayed(const Duration(seconds: 1));

      // Create guest user
      final guestUser = User(
        id: 'guest-${DateTime.now().millisecondsSinceEpoch}',
        username: 'Guest',
        email: 'guest@example.com',
        walletBalance: 1000.0,
      );

      _currentUser = guestUser;
      _isLoggedIn = true;

      // Save to shared preferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        AppConstants.userKey,
        json.encode(guestUser.toJson()),
      );
      await prefs.setBool(AppConstants.isLoggedInKey, true);

      Utils.showToast('Logged in as guest');
      return true;
    } catch (e) {
      debugPrint('Guest login error: $e');
      Utils.showToast('An error occurred', isError: true);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update wallet balance
  Future<bool> updateWalletBalance(double amount) async {
    if (_currentUser == null) return false;

    try {
      // Update user wallet balance
      final updatedUser = _currentUser!.copyWith(
        walletBalance: _currentUser!.walletBalance + amount,
      );

      _currentUser = updatedUser;

      // Save to shared preferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        AppConstants.userKey,
        json.encode(updatedUser.toJson()),
      );

      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Error updating wallet: $e');
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      // Clear shared preferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(AppConstants.userKey);
      await prefs.setBool(AppConstants.isLoggedInKey, false);

      _currentUser = null;
      _isLoggedIn = false;
    } catch (e) {
      debugPrint('Logout error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
