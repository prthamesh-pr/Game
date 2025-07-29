/// API Constants class
/// Contains all API related constants for the application
class ApiConstants {
  static const String qrCodeEndpoint = '/api/qr';
  static const String addTokenEndpoint = '/api/wallet/add-token';
  static const String withdrawEndpoint = '/api/wallet/withdraw';
  // Base URL for API
  static const String baseUrl =
      'https://game-39rz.onrender.com'; // Updated production server
  //'http://192.168.1.7:5000'; // Local server for testing

  // API endpoints
  static const String registerEndpoint = '/api/user/create';
  static const String loginEndpoint = '/api/user/login';
  static const String logoutEndpoint = '/api/user/logout';
  static const String updateProfileEndpoint = '/api/user/update';
  static const String refreshTokenEndpoint = '/api/auth/refresh';
  static const String verifyTokenEndpoint = '/api/auth/verify';

  // User endpoints
  static const String userProfileEndpoint = '/api/user/profile';
  static const String userSelectionsEndpoint = '/api/user/selections';
  static const String walletTransactionsEndpoint =
      '/api/user/wallet/transactions';
  static const String userResultsEndpoint = '/api/user/results';
  static const String userStatsEndpoint = '/api/user/stats';
  static const String changePasswordEndpoint = '/api/user/change-password';

  // Game endpoints
  static const String selectNumberEndpoint = '/api/game/select';
  static const String currentRoundEndpoint = '/api/game/round/current';
  static const String validNumbersEndpoint = '/api/game/numbers';
  static const String gameInfoEndpoint = '/api/game/info';
  static const String recentResultsEndpoint = '/api/game/results/recent';
  static const String allRoundsEndpoint = '/api/game/rounds';
  static const String cancelSelectionEndpoint = '/api/game/cancel';
  static const String currentSelectionsEndpoint =
      '/api/game/selections/current';

  // Local storage keys
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'user_data';
  static const String isLoggedInKey = 'is_logged_in';
}
