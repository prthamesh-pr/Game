import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../constants/colors.dart';
import '../providers/auth_provider.dart';
import '../providers/game_provider_updated.dart';
import '../models/game_result_model.dart';
import '../widgets/custom_appbar.dart';
import '../widgets/loading_spinner.dart';

class ResultsScreen extends StatefulWidget {
  const ResultsScreen({super.key});

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);

    // Add listener to refresh results when tab changes
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        _refreshCurrentTabResults();
      }
    });

    // Fetch results when screen loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _refreshCurrentTabResults();
    });
  }

  void _refreshCurrentTabResults() {
    final gameProvider = Provider.of<GameProviderUpdated>(
      context,
      listen: false,
    );
    gameProvider.loadGameResults();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final gameProvider = Provider.of<GameProviderUpdated>(context);
    final user = authProvider.currentUser;
    final isLoading = gameProvider.isLoading;
    final results = gameProvider.gameResults;

    return Scaffold(
      appBar: CustomAppBar(
        title: 'Results',
        walletBalance: user?.walletBalance,
        showWallet: true,
      ),
      body: isLoading
          ? const Center(child: LoadingSpinner())
          : _buildResultsList(results),
    );
  }

  Widget _buildResultsList(List<GameResult> results) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final List<String> timeSlots = List.generate(13, (i) {
      final hour = 11 + i;
      final dt = DateTime(today.year, today.month, today.day, hour);
      return DateFormat('h:mm a').format(dt);
    });

    return ListView.builder(
      itemCount: timeSlots.length,
      padding: const EdgeInsets.all(16),
      itemBuilder: (context, index) {
        final slotTime = DateTime(
          today.year,
          today.month,
          today.day,
          11 + index,
        );
        final isPast = now.isAfter(slotTime);
        // Find all results for this slot
        final slotResults = results
            .where((r) => r.resultDate.hour == slotTime.hour)
            .toList();
        final displayResult = isPast && slotResults.isNotEmpty
            ? slotResults.map((r) => r.winningNumber).join(', ')
            : '***-*';

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: ListTile(
            leading: Container(
              width: 80,
              alignment: Alignment.center,
              child: Text(
                timeSlots[index],
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
            title: Text(
              displayResult,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: displayResult == '***-*'
                    ? Colors.grey
                    : AppColors.gradientStart,
                letterSpacing: 2,
              ),
              textAlign: TextAlign.right,
            ),
          ),
        );
      },
    );
  }

  // Removed _getClassColor, always use AppColors.gradientStart for result color
}
