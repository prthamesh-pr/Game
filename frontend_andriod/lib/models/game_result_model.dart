class GameResult {
  final String id;
  final String gameClass; // 'A', 'B', or 'C'
  final String winningNumber;
  final DateTime resultDate;

  GameResult({
    required this.id,
    required this.gameClass,
    required this.winningNumber,
    required this.resultDate,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'gameClass': gameClass,
      'winningNumber': winningNumber,
      'resultDate': resultDate.toIso8601String(),
    };
  }

  factory GameResult.fromJson(Map<String, dynamic> json) {
    return GameResult(
      id: json['id'] as String,
      gameClass: json['gameClass'] as String,
      winningNumber: json['winningNumber'] as String,
      resultDate: DateTime.parse(json['resultDate']),
    );
  }
}
