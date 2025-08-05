class HistoryItem {
  final String id;
  final String selectedNumber;
  final String gameClass;
  final int betAmount;
  final String? resultNumber;
  final String status;
  final String timeSlot;
  final DateTime createdAt;
  final bool resultDeclared;
  final int winAmount;

  HistoryItem({
    required this.id,
    required this.selectedNumber,
    required this.gameClass,
    required this.betAmount,
    this.resultNumber,
    required this.status,
    required this.timeSlot,
    required this.createdAt,
    required this.resultDeclared,
    required this.winAmount,
  });

  factory HistoryItem.fromJson(Map<String, dynamic> json) {
    return HistoryItem(
      id: json['_id'] ?? '',
      selectedNumber: json['selectedNumber'] ?? '',
      gameClass: json['gameClass'] ?? '',
      betAmount: json['betAmount'] ?? 0,
      resultNumber: json['resultNumber']?.toString(),
      status: json['resultDeclared'] == true
          ? (json['winAmount'] > 0 ? 'WIN' : 'LOSE')
          : 'PENDING',
      timeSlot: json['timeSlot'] ?? '',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      resultDeclared: json['resultDeclared'] ?? false,
      winAmount: json['winAmount'] ?? 0,
    );
  }
}
