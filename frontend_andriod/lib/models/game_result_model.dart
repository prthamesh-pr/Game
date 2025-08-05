class GameResult {
  final String id;
  final String gameClass; // 'A', 'B', 'C', or 'D'
  final String winningNumber;
  final DateTime resultDate;
  final String? roundId;

  GameResult({
    required this.id,
    required this.gameClass,
    required this.winningNumber,
    required this.resultDate,
    this.roundId,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'gameClass': gameClass,
      'winningNumber': winningNumber,
      'resultDate': resultDate.toIso8601String(),
      'roundId': roundId,
    };
  }

  factory GameResult.fromJson(Map<String, dynamic> json) {
    return GameResult(
      id: json['_id'] ?? json['id'] ?? '',
      gameClass: json['gameClass'] ?? '',
      winningNumber: json['winningNumber']?.toString() ?? '',
      resultDate: DateTime.parse(
        json['createdAt'] ?? json['resultDate'] ?? DateTime.now().toIso8601String(),
      ),
      roundId: json['roundId']?['_id'] ?? json['roundId'],
    );
  }
}
