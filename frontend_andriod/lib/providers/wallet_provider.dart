import 'package:flutter/material.dart';
import '../services/api_service.dart';

class WalletProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Map<String, dynamic>> _transactions = [];
  List<Map<String, dynamic>> _withdrawalRequests = [];
  bool _isLoading = false;
  String? _error;

  List<Map<String, dynamic>> get transactions => _transactions;
  List<Map<String, dynamic>> get withdrawalRequests => _withdrawalRequests;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Add tokens to wallet
  Future<bool> addToken({
    required int amount,
    required String paymentApp,
    String upiId = '',
    String userName = '',
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post('/wallet/add-token', {
        'amount': amount,
        'paymentApp': paymentApp,
        'upiId': upiId,
        'userName': userName,
      });

      if (response['success']) {
        // Reload transactions
        await loadTransactions();
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'];
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Failed to add tokens: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Request withdrawal
  Future<bool> withdrawToken({
    required int amount,
    required String phoneNumber,
    required String paymentApp,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post('/wallet/withdraw', {
        'amount': amount,
        'phoneNumber': phoneNumber,
        'paymentApp': paymentApp,
      });

      if (response['success']) {
        // Reload transactions and withdrawal requests
        await Future.wait([loadTransactions(), loadWithdrawalRequests()]);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'];
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Failed to request withdrawal: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Get wallet balance
  Future<Map<String, dynamic>?> getWalletBalance() async {
    try {
      final response = await _apiService.get('/wallet/balance');

      if (response['success']) {
        return response['data'];
      } else {
        _error = response['message'];
        return null;
      }
    } catch (e) {
      _error = 'Failed to get wallet balance: $e';
      debugPrint('Error getting wallet balance: $e');
      return null;
    }
  }

  // Load wallet transactions
  Future<void> loadTransactions({int page = 1, String? type}) async {
    try {
      _isLoading = true;
      notifyListeners();

      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': '20',
      };

      if (type != null) queryParams['type'] = type;

      final response = await _apiService.get(
        '/wallet/transactions',
        queryParams: queryParams,
      );

      if (response['success']) {
        _transactions = List<Map<String, dynamic>>.from(
          response['data']['transactions'],
        );
      } else {
        _error = response['message'];
      }
    } catch (e) {
      _error = 'Failed to load transactions: $e';
      debugPrint('Error loading transactions: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load withdrawal requests
  Future<void> loadWithdrawalRequests({int page = 1, String? status}) async {
    try {
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': '20',
      };

      if (status != null) queryParams['status'] = status;

      final response = await _apiService.get(
        '/wallet/withdrawals',
        queryParams: queryParams,
      );

      if (response['success']) {
        _withdrawalRequests = List<Map<String, dynamic>>.from(
          response['data']['withdrawalRequests'],
        );
      } else {
        _error = response['message'];
      }
    } catch (e) {
      _error = 'Failed to load withdrawal requests: $e';
      debugPrint('Error loading withdrawal requests: $e');
    }
    notifyListeners();
  }

  // Initialize wallet provider
  Future<void> initialize() async {
    await Future.wait([loadTransactions(), loadWithdrawalRequests()]);
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
