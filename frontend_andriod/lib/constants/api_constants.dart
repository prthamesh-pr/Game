/// API Constants class
/// Contains all API related constants for the application
class ApiConstants {
  // Base URL for API
  static const String baseUrl = 'http://localhost:5000/api';

  // User Authentication endpoints
  static const String registerEndpoint = '/auth/register';
  static const String loginEndpoint = '/auth/login';
  static const String logoutEndpoint = '/auth/logout';
  static const String refreshTokenEndpoint = '/auth/refresh';
  static const String verifyTokenEndpoint = '/auth/verify';

  // Game endpoints
  static const String gameNumbersEndpoint = '/numbers';
  static const String currentRoundEndpoint = '/current-round';
  static const String placeBetEndpoint = '/bet';
  static const String cancelBetEndpoint = '/bet/cancel';
  static const String userBetsEndpoint = '/bets';
  static const String resultsEndpoint = '/results';

  // User Profile endpoints  
  static const String userProfileEndpoint = '/user/profile';
  static const String updateProfileEndpoint = '/user/update';
  static const String changePasswordEndpoint = '/user/change-password';

  // Wallet endpoints
  static const String walletBalanceEndpoint = '/balance';
  static const String walletTransactionsEndpoint = '/transactions';
  static const String addBalanceEndpoint = '/wallet/add';
  static const String withdrawEndpoint = '/wallet/withdraw';

  // QR Code endpoints
  static const String qrCodeGenerateEndpoint = '/qr/generate';
  static const String qrCodeListEndpoint = '/qr/list';

  // Transaction history endpoints
  static const String transactionHistoryEndpoint = '/transactions/history';
  static const String betHistoryEndpoint = '/bets/history';

  // Settings endpoints
  static const String settingsEndpoint = '/settings';
  static const String referralInfoEndpoint = '/user/referral';

  // Local storage keys
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userIdKey = 'user_id';
  static const String usernameKey = 'username';

  // Request timeouts
  static const int connectionTimeout = 30000; // 30 seconds
  static const int receiveTimeout = 30000; // 30 seconds

  // HTTP Status codes
  static const int statusOk = 200;
  static const int statusCreated = 201;
  static const int statusBadRequest = 400;
  static const int statusUnauthorized = 401;
  static const int statusForbidden = 403;
  static const int statusNotFound = 404;
  static const int statusInternalServerError = 500;
}
