import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../constants/colors.dart';
import '../providers/auth_provider.dart';
import '../providers/game_provider.dart';
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
    final gameProvider = Provider.of<GameProvider>(context, listen: false);
    String classType = '';

    switch (_tabController.index) {
      case 0:
        classType = 'A';
        break;
      case 1:
        classType = 'B';
        break;
      case 2:
        classType = 'C';
        break;
    }

    if (classType.isNotEmpty) {
      gameProvider.fetchGameResultsByClass(classType);
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Color _getTabColor(int index) {
    // Unified color for all tabs (Class A, B, C)
    return AppColors.primary;
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final gameProvider = Provider.of<GameProvider>(context);
    final user = authProvider.currentUser;
    final isLoading = gameProvider.isLoading;

    return Scaffold(
      appBar: CustomAppBar(
        title: 'Game Results',
        walletBalance: user?.walletBalance,
        showWallet: true,
      ),
      body: Column(
        children: [
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  _getTabColor(_tabController.index),
                  _getTabColor(_tabController.index).withValues(alpha: 0.8),
                ],
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: TabBar(
              controller: _tabController,
              indicatorColor: Colors.white,
              indicatorWeight: 4,
              indicatorSize: TabBarIndicatorSize.tab,
              indicator: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              labelStyle: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
              unselectedLabelStyle: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Colors.white70,
              ),
              tabs: const [
                Padding(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  child: Text('Class A'),
                ),
                Padding(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  child: Text('Class B'),
                ),
                Padding(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  child: Text('Class C'),
                ),
              ],
            ),
          ),
          Expanded(
            child: isLoading
                ? const Center(child: LoadingSpinner())
                : TabBarView(
                    controller: _tabController,
                    children: [
                      _buildResultsList('A', gameProvider),
                      _buildResultsList('B', gameProvider),
                      _buildResultsList('C', gameProvider),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsList(String gameClass, GameProvider gameProvider) {
    return FutureBuilder<List<GameResult>>(
      // Use the new API method that fetches from backend
      future: gameProvider.fetchGameResultsByClass(gameClass),
      builder: (context, snapshot) {
        // Show loading indicator while waiting for API response
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: LoadingSpinner());
        }

        // Handle error state
        if (snapshot.hasError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.red, size: 48),
                const SizedBox(height: 16),
                Text('Error loading results: ${snapshot.error}'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      // Force refresh
                      gameProvider.fetchGameResultsByClass(gameClass);
                    });
                  },
                  child: const Text('Try Again'),
                ),
              ],
            ),
          );
        }

        // Get results from snapshot or provider
        final results =
            snapshot.data ?? gameProvider.getGameResultsByClass(gameClass);

        if (results.isEmpty) {
          return const Center(
            child: Text('No results available for this class'),
          );
        }

        return ListView.builder(
          itemCount: results.length,
          padding: const EdgeInsets.all(16),
          itemBuilder: (context, index) {
            return _buildResultItem(results[index], gameClass);
          },
        );
      },
    );
  }

  Widget _buildResultItem(GameResult result, String gameClass) {
    final formattedDate = DateFormat(
      'dd MMM yyyy, hh:mm a',
    ).format(result.resultDate);
    final Color classColor = _getClassColor(gameClass);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Colors.white, classColor.withValues(alpha: 0.05)],
          ),
          border: Border.all(
            color: classColor.withValues(alpha: 0.3),
            width: 2,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Draw Date',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        formattedDate,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [classColor, classColor.withValues(alpha: 0.8)],
                      ),
                      borderRadius: BorderRadius.circular(25),
                      boxShadow: [
                        BoxShadow(
                          color: classColor.withValues(alpha: 0.3),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      'Class $gameClass',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Center(
                child: Column(
                  children: [
                    const Text(
                      'Winning Number',
                      style: TextStyle(
                        fontSize: 16,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 16,
                      ),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            classColor.withValues(alpha: 0.1),
                            classColor.withValues(alpha: 0.05),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: classColor.withValues(alpha: 0.3),
                          width: 2,
                        ),
                      ),
                      child: Text(
                        result.winningNumber,
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: classColor,
                          letterSpacing: 2,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: Text(
                  'Result declared at: ${DateFormat('hh:mm a').format(result.resultDate)}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textLight,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getClassColor(String gameClass) {
    switch (gameClass) {
      case 'A':
        return AppColors.gradientStart; // Updated to match the tab color
      case 'B':
        return AppColors.classB;
      case 'C':
        return AppColors.classC;
      default:
        return AppColors.primary;
    }
  }
}
