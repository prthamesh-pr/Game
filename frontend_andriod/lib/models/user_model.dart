class User {
  final String id;
  final String username;
  String email;
  double walletBalance;
  bool isGuest;

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.walletBalance,
    this.isGuest = false,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'walletBalance': walletBalance,
      'isGuest': isGuest,
    };
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      walletBalance: json['walletBalance'].toDouble(),
      isGuest: json['isGuest'] ?? false,
    );
  }

  User copyWith({
    String? id,
    String? username,
    String? email,
    double? walletBalance,
  }) {
    return User(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      walletBalance: walletBalance ?? this.walletBalance,
    );
  }
}
