class HistoryItem {
  final String id;
  final String selectedNumber;
  final String? resultNumber;
  final String status;
  final String timeSlot;

  HistoryItem({
    required this.id,
    required this.selectedNumber,
    this.resultNumber,
    required this.status,
    required this.timeSlot,
  });

  factory HistoryItem.fromJson(Map<String, dynamic> json) {
    return HistoryItem(
      id: json['_id'] ?? '',
      selectedNumber: json['number'] ?? '',
      resultNumber: json['roundInfo']?['winningNumbers']?['classA'] ?? null,
      status: json['status'] == 'win'
          ? 'WIN'
          : json['status'] == 'loss'
          ? 'LOSE'
          : 'Pending',
      timeSlot: json['timeSlot'] ?? '',
    );
  }
}
