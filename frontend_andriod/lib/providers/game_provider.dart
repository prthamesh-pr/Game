import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'dart:math';

import '../models/gameplay_model.dart';
import '../models/game_result_model.dart';
import '../utils/mock_data.dart';
import '../utils/utils.dart';
import '../constants/app_constants.dart';

class GameProvider with ChangeNotifier {
  List<GamePlay> _gamePlays = [];
  List<GameResult> _gameResults = [];
  bool _isLoading = false;

  List<GamePlay> get gamePlays => _gamePlays;
  List<GameResult> get gameResults => _gameResults;
  bool get isLoading => _isLoading;

  // Constructor to initialize state
  GameProvider() {
    // Load game data from shared preferences if available
    _loadGameData();
  }

  // Load game data from shared preferences
  Future<void> _loadGameData() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final gamesPlayedData = prefs.getString(AppConstants.gamesPlayedKey);
      final gameResultsData = prefs.getString(AppConstants.resultsKey);

      if (gamesPlayedData != null) {
        final List<dynamic> decodedGamePlays = json.decode(gamesPlayedData);
        _gamePlays = decodedGamePlays
            .map((gamePlay) => GamePlay.fromJson(gamePlay))
            .toList();
      }

      if (gameResultsData != null) {
        final List<dynamic> decodedResults = json.decode(gameResultsData);
        _gameResults = decodedResults
            .map((result) => GameResult.fromJson(result))
            .toList();
      } else {
        // Initialize with mock results if none exist
        _gameResults = MockData.getMockGameResults();
        await _saveGameResults();
      }
    } catch (e) {
      debugPrint('Error loading game data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Save game plays to shared preferences
  Future<void> _saveGamePlays() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final encodedGamePlays = json.encode(
        _gamePlays.map((gamePlay) => gamePlay.toJson()).toList(),
      );
      await prefs.setString(AppConstants.gamesPlayedKey, encodedGamePlays);
    } catch (e) {
      debugPrint('Error saving game plays: $e');
    }
  }

  // Save game results to shared preferences
  Future<void> _saveGameResults() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final encodedResults = json.encode(
        _gameResults.map((result) => result.toJson()).toList(),
      );
      await prefs.setString(AppConstants.resultsKey, encodedResults);
    } catch (e) {
      debugPrint('Error saving game results: $e');
    }
  }

  // Place a bet
  Future<bool> placeBet(
    String userId,
    String gameClass,
    String selectedNumber,
    double amount,
  ) async {
    _isLoading = true;
    notifyListeners();

    try {
      // Simulate API call delay
      await Future.delayed(const Duration(milliseconds: 800));

      final Random random = Random();

      // Create a new game play
      final GamePlay newGamePlay = GamePlay(
        id: 'gp-${DateTime.now().millisecondsSinceEpoch}-${random.nextInt(1000)}',
        userId: userId,
        gameClass: gameClass,
        selectedNumber: selectedNumber,
        amount: amount,
        playedAt: DateTime.now(),
        isWinner: false, // Will be updated when result is declared
        resultNumber: null, // Will be updated when result is declared
      );

      // Add to game plays list
      _gamePlays.add(newGamePlay);

      // Sort by date (newest first)
      _gamePlays.sort((a, b) => b.playedAt.compareTo(a.playedAt));

      // Save to shared preferences
      await _saveGamePlays();

      Utils.showToast(AppConstants.betPlacedSuccess);
      return true;
    } catch (e) {
      debugPrint('Error placing bet: $e');
      Utils.showToast('An error occurred', isError: true);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get game plays by user ID
  List<GamePlay> getGamePlaysByUser(String userId) {
    return _gamePlays.where((gamePlay) => gamePlay.userId == userId).toList();
  }

  // Get game results by class
  List<GameResult> getGameResultsByClass(String gameClass) {
    return _gameResults
        .where((result) => result.gameClass == gameClass)
        .toList();
  }

  // Get latest result by class
  GameResult? getLatestResultByClass(String gameClass) {
    final classList = _gameResults
        .where((result) => result.gameClass == gameClass)
        .toList();
    return classList.isNotEmpty ? classList.first : null;
  }

  // Generate new result (simulated)
  Future<GameResult> generateResult(String gameClass) async {
    _isLoading = true;
    notifyListeners();

    try {
      // Simulate API call delay
      await Future.delayed(const Duration(seconds: 1));

      final Random random = Random();
      String winningNumber;

      // Generate winning number based on game class
      if (gameClass == 'A') {
        final numbers = MockData.getClassANumbers();
        winningNumber = numbers[random.nextInt(numbers.length)];
      } else if (gameClass == 'B') {
        final numbers = MockData.getClassBNumbers();
        winningNumber = numbers[random.nextInt(numbers.length)];
      } else {
        final numbers = MockData.getClassCNumbers();
        winningNumber = numbers[random.nextInt(numbers.length)];
      }

      // Create new result
      final GameResult newResult = GameResult(
        id: 'res-${DateTime.now().millisecondsSinceEpoch}-${random.nextInt(1000)}',
        gameClass: gameClass,
        winningNumber: winningNumber,
        resultDate: DateTime.now(),
      );

      // Update game plays with this result
      for (int i = 0; i < _gamePlays.length; i++) {
        final gamePlay = _gamePlays[i];
        if (gamePlay.gameClass == gameClass &&
            gamePlay.resultNumber == null &&
            gamePlay.playedAt.day == DateTime.now().day) {
          // Update game play with result
          final isWinner = gamePlay.selectedNumber == winningNumber;
          _gamePlays[i] = GamePlay(
            id: gamePlay.id,
            userId: gamePlay.userId,
            gameClass: gamePlay.gameClass,
            selectedNumber: gamePlay.selectedNumber,
            amount: gamePlay.amount,
            playedAt: gamePlay.playedAt,
            isWinner: isWinner,
            resultNumber: winningNumber,
          );
        }
      }

      // Add to results list
      _gameResults.add(newResult);

      // Sort by date (newest first)
      _gameResults.sort((a, b) => b.resultDate.compareTo(a.resultDate));

      // Save to shared preferences
      await _saveGamePlays();
      await _saveGameResults();

      return newResult;
    } catch (e) {
      debugPrint('Error generating result: $e');
      throw Exception('Failed to generate result');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Reset mock data
  Future<void> resetMockData(String userId) async {
    _isLoading = true;
    notifyListeners();

    try {
      // Generate new mock data
      _gamePlays = MockData.getMockGamePlays(userId);
      _gameResults = MockData.getMockGameResults();

      // Save to shared preferences
      await _saveGamePlays();
      await _saveGameResults();
    } catch (e) {
      debugPrint('Error resetting mock data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
