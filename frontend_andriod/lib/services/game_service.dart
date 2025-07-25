import 'package:flutter/foundation.dart';

import '../constants/api_constants.dart';
import '../utils/utils.dart';
import 'api_service.dart';

class GameService {
  final ApiService _apiService = ApiService();

  // Singleton pattern
  static final GameService _instance = GameService._internal();
  factory GameService() => _instance;
  GameService._internal();

  // Get current game round
  Future<Map<String, dynamic>> getCurrentRound() async {
    try {
      final response = await _apiService.get(
        ApiConstants.currentRoundEndpoint,
        requireAuth: false, // Allow unauthenticated access
      );
      return response;
    } catch (e) {
      debugPrint('Get current round error: $e');
      rethrow;
    }
  }

  // Get valid numbers for a class type
  Future<Map<String, dynamic>> getValidNumbers(String classType) async {
    try {
      final response = await _apiService.get(
        '${ApiConstants.validNumbersEndpoint}/$classType',
        requireAuth: false, // Allow unauthenticated access
      );
      return response;
    } catch (e) {
      debugPrint('Get valid numbers error: $e');
      rethrow;
    }
  }

  // Get game information
  Future<Map<String, dynamic>> getGameInfo() async {
    try {
      final response = await _apiService.get(
        ApiConstants.gameInfoEndpoint,
        requireAuth: false, // Allow unauthenticated access
      );
      return response;
    } catch (e) {
      debugPrint('Get game info error: $e');
      rethrow;
    }
  }

  // Get recent results
  Future<Map<String, dynamic>> getRecentResults() async {
    try {
      final response = await _apiService.get(
        ApiConstants.recentResultsEndpoint,
        requireAuth: false, // Allow unauthenticated access
      );
      return response;
    } catch (e) {
      debugPrint('Get recent results error: $e');
      rethrow;
    }
  }

  // Get results by class type
  Future<Map<String, dynamic>> getResultsByClass(String classType) async {
    try {
      final response = await _apiService.get(
        '${ApiConstants.recentResultsEndpoint}?class=$classType',
        requireAuth: false, // Allow unauthenticated access
      );
      return response;
    } catch (e) {
      debugPrint('Get results by class error: $e');
      rethrow;
    }
  }

  // Get all rounds with pagination
  Future<Map<String, dynamic>> getAllRounds({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await _apiService.get(
        '${ApiConstants.allRoundsEndpoint}?page=$page&limit=$limit',
        requireAuth: false, // Allow unauthenticated access
      );
      return response;
    } catch (e) {
      debugPrint('Get all rounds error: $e');
      rethrow;
    }
  }

  // Select a number for the current round
  Future<Map<String, dynamic>> selectNumber({
    required String classType,
    required int number,
    required double amount,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.selectNumberEndpoint,
        {'classType': classType, 'number': number, 'amount': amount},
      );

      Utils.showToast('Number selected successfully');
      return response;
    } catch (e) {
      debugPrint('Select number error: $e');
      Utils.showToast('Failed to select number', isError: true);
      rethrow;
    }
  }

  // Cancel a selection
  Future<Map<String, dynamic>> cancelSelection(String selectionId) async {
    try {
      final response = await _apiService.post(
        ApiConstants.cancelSelectionEndpoint,
        {'selectionId': selectionId},
      );

      Utils.showToast('Selection cancelled successfully');
      return response;
    } catch (e) {
      debugPrint('Cancel selection error: $e');
      Utils.showToast('Failed to cancel selection', isError: true);
      rethrow;
    }
  }

  // Get current selections
  Future<Map<String, dynamic>> getCurrentSelections() async {
    try {
      final response = await _apiService.get(
        ApiConstants.currentSelectionsEndpoint,
      );
      return response;
    } catch (e) {
      debugPrint('Get current selections error: $e');
      rethrow;
    }
  }
}
