import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../constants/colors.dart';
import '../providers/auth_provider.dart';
import '../providers/game_provider.dart';
import '../models/gameplay_model.dart';
import '../widgets/custom_appbar.dart';
import '../widgets/loading_spinner.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final gameProvider = Provider.of<GameProvider>(context);
    final user = authProvider.currentUser;

    if (user == null) {
      return const Scaffold(body: Center(child: Text('User not found')));
    }

    return Scaffold(
      appBar: CustomAppBar(
        title: 'My Play History',
        walletBalance: user.walletBalance,
        showWallet: true,
      ),
      body: RefreshIndicator(
        onRefresh: () => gameProvider.loadGameData(),
        child: gameProvider.isLoading
            ? const Center(child: LoadingSpinner())
            : FutureBuilder<List<GamePlay>>(
                // Fetch user's game history on demand
                future: _fetchUserGameHistory(user.id, gameProvider),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: LoadingSpinner());
                  }

                  if (snapshot.hasError) {
                    return Center(
                      child: Text(
                        'Error loading history: ${snapshot.error}',
                        textAlign: TextAlign.center,
                      ),
                    );
                  }

                  final userGamePlays = snapshot.data ?? [];

                  if (userGamePlays.isEmpty) {
                    return const Center(child: Text('No game history found'));
                  }

                  return ListView.builder(
                    itemCount: userGamePlays.length,
                    padding: const EdgeInsets.all(16),
                    itemBuilder: (context, index) {
                      return _buildHistoryItem(context, userGamePlays[index]);
                    },
                  );
                },
              ),
      ),
    );
  }

  Future<List<GamePlay>> _fetchUserGameHistory(
    String userId,
    GameProvider gameProvider,
  ) async {
    // First try to get data from provider cache
    List<GamePlay> userGamePlays = gameProvider.getGamePlaysByUser(userId);

    // If no data in cache, explicitly load it
    if (userGamePlays.isEmpty && !gameProvider.isLoading) {
      await gameProvider.loadGameData();
      userGamePlays = gameProvider.getGamePlaysByUser(userId);
    }

    return userGamePlays;
  }

  Widget _buildHistoryItem(BuildContext context, GamePlay gamePlay) {
    final Color statusColor = gamePlay.isWinner
        ? AppColors.success
        : AppColors.error;
    final String statusText = gamePlay.isWinner ? 'WIN' : 'LOSE';
    final String formattedDate = DateFormat(
      'dd MMM yyyy, hh:mm a',
    ).format(gamePlay.playedAt);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Class ${gamePlay.gameClass}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: statusColor,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    statusText,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Selected Number'),
                      const SizedBox(height: 4),
                      Text(
                        gamePlay.selectedNumber,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                if (gamePlay.resultNumber != null)
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Result Number'),
                        const SizedBox(height: 4),
                        Text(
                          gamePlay.resultNumber!,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Text('Amount'),
                      const SizedBox(height: 4),
                      Text(
                        '₹${gamePlay.amount.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const Divider(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Start: ' + (gamePlay.roundInfo?.startTime ?? '-'), style: const TextStyle(fontSize: 12, color: AppColors.textLight)),
                    Text('End: ' + (gamePlay.roundInfo?.endTime ?? '-'), style: const TextStyle(fontSize: 12, color: AppColors.textLight)),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: (gamePlay.roundInfo?.resultDeclared ?? false) ? Colors.green[100] : Colors.orange[100],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    (gamePlay.roundInfo?.resultDeclared ?? false) ? 'Result Declared' : 'Pending',
                    style: TextStyle(
                      color: (gamePlay.roundInfo?.resultDeclared ?? false) ? Colors.green : Colors.orange,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
