class User {
  final String id;
  final String username;
  String email;
  double walletBalance;

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.walletBalance,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'walletBalance': walletBalance,
    };
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      walletBalance: json['walletBalance'].toDouble(),
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
