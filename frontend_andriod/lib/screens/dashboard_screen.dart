import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../constants/colors.dart';
import '../constants/app_constants.dart';
import '../providers/auth_provider.dart';
import '../widgets/custom_appbar.dart';
import '../widgets/app_drawer.dart';
import '../widgets/responsive_layout.dart';
import '../widgets/animated_widgets.dart';
import '../widgets/loading_shimmer.dart';
import '../utils/platform_utils.dart';
import '../utils/mock_data.dart';
import '../screens/game_screen.dart';
import '../widgets/live_stats_widget.dart';
import '../screens/results_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  Future<void> _initializeData() async {
    // Simulate loading data
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final user = authProvider.currentUser;
        final walletBalance = user?.walletBalance ?? 0.0;

        return Scaffold(
          appBar: CustomAppBar(
            title: AppConstants.appName,
            walletBalance: walletBalance,
            showWallet: true,
            actions: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                onPressed: () {
                  _showNotifications(context);
                },
              ),
              if (!kIsWeb)
                IconButton(
                  icon: const Icon(Icons.refresh, color: Colors.white),
                  onPressed: () {
                    _refreshDashboard(context);
                  },
                ),
            ],
          ),
          drawer: const AppDrawer(),
          body: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  AppColors.background,
                  Color(0xFFF5F7FA),
                ],
              ),
            ),
            child: _isLoading 
                ? const DashboardLoadingShimmer()
                : ResponsiveBuilder(
                    builder: (context, constraints) {
                      if (kIsWeb && PlatformUtils.isLargeScreen(constraints.maxWidth)) {
                        return _buildWebLayout(context, authProvider, constraints.maxWidth);
                      } else {
                        return _buildMobileLayout(context, authProvider);
                      }
                    },
                  ),
          ),
        );
      },
    );
  }

  Widget _buildWebLayout(BuildContext context, AuthProvider authProvider, double screenWidth) {
    return SingleChildScrollView(
      padding: PlatformUtils.getScreenPadding(screenWidth),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildWelcomeSection(context, authProvider, isWeb: true),
          const SizedBox(height: 30),
          _buildStatsSection(context, isWeb: true),
          const SizedBox(height: 20),
          const LiveStatsWidget(),
          const SizedBox(height: 30),
          _buildGameClassesSection(context, isWeb: true),
          const SizedBox(height: 30),
          _buildRecentResultsSection(context, isWeb: true),
        ],
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context, AuthProvider authProvider) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildWelcomeSection(context, authProvider, isWeb: false),
          const SizedBox(height: 20),
          _buildStatsSection(context, isWeb: false),
          const SizedBox(height: 15),
          const LiveStatsWidget(),
          const SizedBox(height: 20),
          _buildGameClassesSection(context, isWeb: false),
          const SizedBox(height: 20),
          _buildRecentResultsSection(context, isWeb: false),
        ],
      ),
    );
  }

  Widget _buildWelcomeSection(BuildContext context, AuthProvider authProvider, {required bool isWeb}) {
    final user = authProvider.currentUser;
    final fontSize = isWeb ? 28.0 : 24.0;
    final subtitleSize = isWeb ? 16.0 : 14.0;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(isWeb ? 30 : 20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary, AppColors.secondary],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: isWeb ? 60 : 50,
                height: isWeb ? 60 : 50,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Icon(
                  Icons.casino,
                  color: Colors.white,
                  size: isWeb ? 30 : 25,
                ),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome back,',
                      style: GoogleFonts.poppins(
                        fontSize: subtitleSize,
                        color: Colors.white.withValues(alpha: 0.9),
                      ),
                    ),
                    Text(
                      user?.username ?? 'Player',
                      style: GoogleFonts.poppins(
                        fontSize: fontSize,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            AppConstants.appTagline,
            style: GoogleFonts.poppins(
              fontSize: subtitleSize,
              color: Colors.white.withValues(alpha: 0.9),
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () => _quickPlay(context),
            icon: const Icon(Icons.play_arrow, color: AppColors.primary),
            label: Text(
              'Quick Play',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              padding: EdgeInsets.symmetric(
                horizontal: isWeb ? 30 : 25,
                vertical: isWeb ? 15 : 12,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(25),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsSection(BuildContext context, {required bool isWeb}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Your Statistics',
          style: GoogleFonts.poppins(
            fontSize: isWeb ? 24 : 20,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        SizedBox(height: isWeb ? 20 : 15),
        isWeb
            ? Row(
                children: [
                  Expanded(child: _buildStatCard('Games Played', 127, Icons.games, AppColors.info)),
                  const SizedBox(width: 15),
                  Expanded(child: _buildStatCard('Total Wins', 45, Icons.emoji_events, AppColors.success)),
                  const SizedBox(width: 15),
                  Expanded(child: _buildStatCard('Win Rate', 35, Icons.trending_up, AppColors.warning, suffix: '%')),
                  const SizedBox(width: 15),
                  Expanded(child: _buildStatCard('Current Streak', 3, Icons.local_fire_department, AppColors.error)),
                ],
              )
            : Column(
                children: [
                  Row(
                    children: [
                      Expanded(child: _buildStatCard('Games Played', 127, Icons.games, AppColors.info)),
                      const SizedBox(width: 15),
                      Expanded(child: _buildStatCard('Total Wins', 45, Icons.emoji_events, AppColors.success)),
                    ],
                  ),
                  const SizedBox(height: 15),
                  Row(
                    children: [
                      Expanded(child: _buildStatCard('Win Rate', 35, Icons.trending_up, AppColors.warning, suffix: '%')),
                      const SizedBox(width: 15),
                      Expanded(child: _buildStatCard('Current Streak', 3, Icons.local_fire_department, AppColors.error)),
                    ],
                  ),
                ],
              ),
      ],
    );
  }

  Widget _buildStatCard(String title, int value, IconData icon, Color color, {String suffix = ''}) {
    return AnimatedCard(
      onTap: () {},
      padding: const EdgeInsets.all(20),
      backgroundColor: Colors.white,
      borderRadius: BorderRadius.circular(15),
      boxShadow: [
        BoxShadow(
          color: Colors.grey.withValues(alpha: 0.1),
          blurRadius: 10,
          offset: const Offset(0, 5),
        ),
      ],
      child: Column(
        children: [
          PulsingWidget(
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 30, color: color),
            ),
          ),
          const SizedBox(height: 15),
          AnimatedCounter(
            targetValue: value,
            suffix: suffix,
            textStyle: GoogleFonts.poppins(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            title,
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGameClassesSection(BuildContext context, {required bool isWeb}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Game Classes',
              style: GoogleFonts.poppins(
                fontSize: isWeb ? 24 : 20,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            TextButton.icon(
              onPressed: () => _viewAllGames(context),
              icon: const Icon(Icons.arrow_forward, size: 16),
              label: const Text('View All'),
            ),
          ],
        ),
        SizedBox(height: isWeb ? 20 : 15),
        ResponsiveBuilder(
          builder: (context, constraints) {
            final screenWidth = constraints.maxWidth;
            
            // For very small screens (phones in portrait)
            if (screenWidth < 600) {
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Column(
                  children: [
                    _buildGameClassCard('A', 'Repeating Numbers\n(111, 222, 333)', AppColors.classA, context, isMobile: true),
                    const SizedBox(height: 15),
                    _buildGameClassCard('B', 'Pattern Numbers\n(112, 221, 334)', AppColors.classB, context, isMobile: true),
                    const SizedBox(height: 15),
                    _buildGameClassCard('C', 'Unique Numbers\n(123, 456, 789)', AppColors.classC, context, isMobile: true),
                  ],
                ),
              );
            }
            // For tablets in portrait or small landscape
            else if (screenWidth < 900) {
              return Column(
                children: [
                  Row(
                    children: [
                      Expanded(child: _buildGameClassCard('A', 'Repeating Numbers\n(111, 222, 333)', AppColors.classA, context)),
                      const SizedBox(width: 15),
                      Expanded(child: _buildGameClassCard('B', 'Pattern Numbers\n(112, 221, 334)', AppColors.classB, context)),
                    ],
                  ),
                  const SizedBox(height: 15),
                  SizedBox(
                    width: screenWidth * 0.5,
                    child: _buildGameClassCard('C', 'Unique Numbers\n(123, 456, 789)', AppColors.classC, context),
                  ),
                ],
              );
            }
            // For large screens (tablets in landscape, desktop)
            else {
              return Row(
                children: [
                  Expanded(child: _buildGameClassCard('A', 'Repeating Numbers\n(111, 222, 333)', AppColors.classA, context)),
                  const SizedBox(width: 20),
                  Expanded(child: _buildGameClassCard('B', 'Pattern Numbers\n(112, 221, 334)', AppColors.classB, context)),
                  const SizedBox(width: 20),
                  Expanded(child: _buildGameClassCard('C', 'Unique Numbers\n(123, 456, 789)', AppColors.classC, context)),
                ],
              );
            }
          },
        ),
      ],
    );
  }

  Widget _buildGameClassCard(String gameClass, String description, Color color, BuildContext context, {bool isMobile = false}) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final cardWidth = isMobile ? constraints.maxWidth : null;
        final horizontalPadding = isMobile ? 20.0 : 25.0;
        final verticalPadding = isMobile ? 20.0 : 25.0;
        final iconSize = isMobile ? 70.0 : 80.0;
        final titleFontSize = isMobile ? 18.0 : 20.0;
        final descriptionFontSize = isMobile ? 13.0 : 14.0;
        
        return SizedBox(
          width: cardWidth,
          child: AnimatedCard(
            onTap: () => _navigateToGame(context, gameClass),
            backgroundColor: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: color.withValues(alpha: 0.2),
                blurRadius: 15,
                offset: const Offset(0, 8),
              ),
            ],
            padding: EdgeInsets.symmetric(
              horizontal: horizontalPadding,
              vertical: verticalPadding,
            ),
            child: Column(
              children: [
                PulsingWidget(
                  duration: const Duration(seconds: 2),
                  child: Container(
                    width: iconSize,
                    height: iconSize,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [color, color.withValues(alpha: 0.7)],
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: color.withValues(alpha: 0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        gameClass,
                        style: GoogleFonts.poppins(
                          fontSize: isMobile ? 28 : 32,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 15),
                Text(
                  'Class $gameClass',
                  style: GoogleFonts.poppins(
                    fontSize: titleFontSize,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  description,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(
                    fontSize: descriptionFontSize,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 20),
                FloatingActionIcon(
                  icon: Icons.play_arrow,
                  onPressed: () => _navigateToGame(context, gameClass),
                  backgroundColor: color,
                  size: 50,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildRecentResultsSection(BuildContext context, {required bool isWeb}) {
    final results = MockData.getMockGameResults().take(5).toList();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Results',
              style: GoogleFonts.poppins(
                fontSize: isWeb ? 24 : 20,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            TextButton.icon(
              onPressed: () => _viewAllResults(context),
              icon: const Icon(Icons.arrow_forward, size: 16),
              label: const Text('View All'),
            ),
          ],
        ),
        SizedBox(height: isWeb ? 20 : 15),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(15),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withValues(alpha: 0.1),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: results.length,
            separatorBuilder: (context, index) => const Divider(height: 1, indent: 20, endIndent: 20),
            itemBuilder: (context, index) {
              final result = results[index];
              return ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                leading: Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        _getClassColor(result.gameClass),
                        _getClassColor(result.gameClass).withValues(alpha: 0.7),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      result.gameClass,
                      style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                title: Text(
                  'Winning Number: ${result.winningNumber}',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                subtitle: Text(
                  DateFormat('MMM dd, yyyy • hh:mm a').format(result.resultDate),
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                trailing: Icon(
                  Icons.arrow_forward_ios,
                  size: 16,
                  color: AppColors.textSecondary,
                ),
                onTap: () => _viewResultDetails(context, result),
              );
            },
          ),
        ),
      ],
    );
  }

  Color _getClassColor(String gameClass) {
    switch (gameClass) {
      case 'A': return AppColors.classA;
      case 'B': return AppColors.classB;
      case 'C': return AppColors.classC;
      default: return AppColors.primary;
    }
  }

  // Navigation and action methods
  void _navigateToGame(BuildContext context, String gameClass) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => GameScreen(gameClass: gameClass),
      ),
    );
  }

  void _quickPlay(BuildContext context) {
    // Navigate to the most popular game class (A)
    _navigateToGame(context, 'A');
  }

  void _viewAllGames(BuildContext context) {
    // Show bottom sheet with all game classes
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Select Game Class',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            _buildGameClassCard('A', 'Repeating Numbers (111, 222, 333)', AppColors.classA, context),
            const SizedBox(height: 15),
            _buildGameClassCard('B', 'Pattern Numbers (112, 221, 334)', AppColors.classB, context),
            const SizedBox(height: 15),
            _buildGameClassCard('C', 'Unique Numbers (123, 456, 789)', AppColors.classC, context),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  void _viewAllResults(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ResultsScreen()),
    );
  }

  void _viewResultDetails(BuildContext context, result) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        title: Text('Game Result Details', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Class: ${result.gameClass}', style: GoogleFonts.poppins()),
            Text('Winning Number: ${result.winningNumber}', style: GoogleFonts.poppins()),
            Text('Date: ${DateFormat('MMM dd, yyyy • hh:mm a').format(result.resultDate)}', style: GoogleFonts.poppins()),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showNotifications(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('No new notifications', style: GoogleFonts.poppins()),
        backgroundColor: AppColors.primary,
      ),
    );
  }

  void _refreshDashboard(BuildContext context) {
    setState(() {
      _isLoading = true;
    });
    
    _initializeData();
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Dashboard refreshed!', style: GoogleFonts.poppins()),
        backgroundColor: AppColors.success,
      ),
    );
  }
}
