import 'package:flutter/foundation.dart';
import 'api_service.dart';
import '../constants/api_constants.dart';

class WalletService {
  final ApiService _apiService = ApiService();

  // Singleton pattern
  static final WalletService _instance = WalletService._internal();
  factory WalletService() => _instance;
  WalletService._internal();

  // Fetch QR code for Add Token
  Future<String> fetchQrCodeUrl() async {
    try {
      final response = await _apiService.get(ApiConstants.qrCodeEndpoint);
      return response['data']['imageData'] ?? '';
    } catch (e) {
      debugPrint('Fetch QR code error: $e');
      return '';
    }
  }

  // Request Add Token
  Future<bool> requestAddToken(int amount, String upiId, String userName, String paymentApp) async {
    try {
      await _apiService.post(ApiConstants.addTokenEndpoint, {
        'amount': amount,
        'upiId': upiId,
        'userName': userName,
        'paymentApp': paymentApp,
      });
      return true;
    } catch (e) {
      debugPrint('Add token request error: $e');
      return false;
    }
  }

  // Request Withdraw
  Future<bool> requestWithdraw(int amount, String phone, String paymentApp) async {
    try {
      await _apiService.post(ApiConstants.withdrawEndpoint, {
        'amount': amount,
        'phoneNumber': phone,
        'paymentApp': paymentApp,
      });
      return true;
    } catch (e) {
      debugPrint('Withdraw request error: $e');
      return false;
    }
  }
}
