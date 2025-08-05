import 'package:flutter/material.dart';
import '../models/bet_model.dart';
import '../models/game_result_model.dart';
import '../services/api_service.dart';
import '../providers/auth_provider.dart';

class GameProviderUpdated with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Bet> _userBets = [];
  List<GameResult> _gameResults = [];
  List<Map<String, dynamic>> _activeRounds = [];
  bool _isLoading = false;
  String? _error;

  List<Bet> get userBets => _userBets;
  List<GameResult> get gameResults => _gameResults;
  List<Map<String, dynamic>> get activeRounds => _activeRounds;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Get game numbers for a specific class
  Future<List<String>> getGameNumbers(String gameClass) async {
    try {
      final response = await _apiService.get('/game/numbers/$gameClass');
      if (response['success']) {
        return List<String>.from(response['data']['numbers']);
      } else {
        throw Exception(response['message']);
      }
    } catch (e) {
      debugPrint('Error getting game numbers: $e');
      return [];
    }
  }

  // Place a bet
  Future<bool> placeBet({
    required String gameClass,
    required String selectedNumber,
    required int betAmount,
    required String timeSlot,
    required AuthProvider authProvider,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post('/game/bet', {
        'gameClass': gameClass,
        'selectedNumber': selectedNumber,
        'betAmount': betAmount,
        'timeSlot': timeSlot,
      });

      if (response['success']) {
        // Update user's wallet balance in auth provider
        authProvider.updateWalletBalance(response['data']['newWalletBalance']);

        // Reload user bets
        await loadUserBets();

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
      _error = 'Failed to place bet: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Load user's betting history
  Future<void> loadUserBets({
    int page = 1,
    String? gameClass,
    String? status,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': '20',
      };

      if (gameClass != null) queryParams['gameClass'] = gameClass;
      if (status != null) queryParams['status'] = status;

      final response = await _apiService.get(
        '/game/bets',
        queryParams: queryParams,
      );

      if (response['success']) {
        final betsData = response['data']['bets'] as List;
        _userBets = betsData.map((bet) => Bet.fromJson(bet)).toList();
      } else {
        _error = response['message'];
      }
    } catch (e) {
      _error = 'Failed to load bets: $e';
      debugPrint('Error loading user bets: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load game results
  Future<void> loadGameResults({int page = 1, String? gameClass}) async {
    try {
      _isLoading = true;
      notifyListeners();

      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': '20',
      };

      if (gameClass != null) queryParams['gameClass'] = gameClass;

      final response = await _apiService.get(
        '/game/results',
        queryParams: queryParams,
      );

      if (response['success']) {
        final resultsData = response['data']['results'] as List;
        _gameResults = resultsData
            .map((result) => GameResult.fromJson(result))
            .toList();
      } else {
        _error = response['message'];
      }
    } catch (e) {
      _error = 'Failed to load results: $e';
      debugPrint('Error loading game results: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load active rounds
  Future<void> loadActiveRounds() async {
    try {
      final response = await _apiService.get('/game/rounds/active');

      if (response['success']) {
        _activeRounds = List<Map<String, dynamic>>.from(response['data']);
      } else {
        _error = response['message'];
      }
    } catch (e) {
      _error = 'Failed to load active rounds: $e';
      debugPrint('Error loading active rounds: $e');
    }
    notifyListeners();
  }

  // Initialize provider
  Future<void> initialize() async {
    await Future.wait([loadUserBets(), loadGameResults(), loadActiveRounds()]);
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
