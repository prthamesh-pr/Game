import 'package:flutter/material.dart';

import '../models/gameplay_model.dart';
import '../models/game_result_model.dart';
import '../utils/utils.dart';
import '../services/game_service.dart';
import '../services/user_service.dart';
import '../providers/auth_provider.dart';

class GameProvider with ChangeNotifier {
  final GameService _gameService = GameService();
  final UserService _userService = UserService();

  List<GamePlay> _gamePlays = [];
  List<GameResult> _gameResults = [];
  Map<String, dynamic>? _currentRound;
  bool _isLoading = false;

  List<GamePlay> get gamePlays => _gamePlays;
  List<GameResult> get gameResults => _gameResults;
  Map<String, dynamic>? get currentRound => _currentRound;
  bool get isLoading => _isLoading;

  // Constructor to initialize state
  GameProvider() {
    loadGameData();
  }

  // Safe load game data with error handling
  Future<void> loadGameData() async {
    try {
      _isLoading = true;
      notifyListeners();

      await Future.wait([
        _loadCurrentRound(),
        _loadResults(),
        _loadGamePlays(),
      ]);
    } catch (e) {
      debugPrint('Error in safe load game data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load current round information
  Future<void> _loadCurrentRound() async {
    try {
      final response = await _gameService.getCurrentRound();
      _currentRound = response;
    } catch (e) {
      debugPrint('Error loading current round: $e');
    }
  }

  // Load recent results
  Future<void> _loadResults() async {
    try {
      final response = await _gameService.getRecentResults();

      final results = (response['results'] as List)
          .map((item) => GameResult.fromJson(item))
          .toList();

      _gameResults = results;
    } catch (e) {
      debugPrint('Error loading game results: $e');
    }
  }

  // Load user game plays
  Future<void> _loadGamePlays() async {
    try {
      final response = await _userService.getUserSelections(limit: 50);

      final plays = (response['selections'] as List)
          .map((item) => GamePlay.fromJson(item))
          .toList();

      _gamePlays = plays;
    } catch (e) {
      debugPrint('Error loading game plays: $e');
    }
  }

  // Select a number for the current game
  Future<bool> selectNumber({
    required String gameClass,
    required String number,
    required double amount,
    required AuthProvider authProvider,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _gameService.selectNumber(
        classType: gameClass,
        number: int.parse(number),
        amount: amount,
      );

      // Refresh user wallet balance
      await authProvider.refreshWalletBalance();

      // Reload user game plays
      await _loadGamePlays();

      Utils.showToast('Number selected successfully!');
      return true;
    } catch (e) {
      debugPrint('Select number error: $e');
      Utils.showToast('Failed to select number', isError: true);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Cancel a selection
  Future<bool> cancelSelection(
    String selectionId,
    AuthProvider authProvider,
  ) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _gameService.cancelSelection(selectionId);

      // Refresh user wallet balance
      await authProvider.refreshWalletBalance();

      // Reload user game plays
      await _loadGamePlays();

      Utils.showToast('Selection cancelled successfully!');
      return true;
    } catch (e) {
      debugPrint('Cancel selection error: $e');
      Utils.showToast('Failed to cancel selection', isError: true);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get valid numbers for a specific class
  Future<List<String>> getValidNumbers(String gameClass) async {
    try {
      final response = await _gameService.getValidNumbers(gameClass);

      final validNumbers = (response['validNumbers'] as List)
          .map((item) => item.toString())
          .toList();

      return validNumbers;
    } catch (e) {
      debugPrint('Get valid numbers error: $e');
      return [];
    }
  }

  // Get all game rounds with pagination
  Future<Map<String, dynamic>> getAllRounds({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await _gameService.getAllRounds(
        page: page,
        limit: limit,
      );
      return response;
    } catch (e) {
      debugPrint('Get all rounds error: $e');
      return {'rounds': [], 'total': 0, 'page': page, 'limit': limit};
    }
  }

  // Get current user selections for the current round
  Future<List<GamePlay>> getCurrentSelections() async {
    try {
      final response = await _gameService.getCurrentSelections();

      final selections = (response['selections'] as List)
          .map((item) => GamePlay.fromJson(item))
          .toList();

      return selections;
    } catch (e) {
      debugPrint('Get current selections error: $e');
      return [];
    }
  }
}
