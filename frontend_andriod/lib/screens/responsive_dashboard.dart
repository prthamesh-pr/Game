import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../constants/colors.dart';
import '../constants/app_constants.dart';
import '../providers/auth_provider.dart';
import '../widgets/responsive_layout.dart';
import '../utils/platform_utils.dart';
import '../utils/mock_data.dart';

class ResponsiveDashboard extends StatelessWidget {
  const ResponsiveDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    if (kIsWeb) {
      return const WebDashboard();
    } else {
      return const MobileDashboard();
    }
  }
}

class WebDashboard extends StatelessWidget {
  const WebDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return ResponsiveBuilder(
      builder: (context, constraints) {
        final screenWidth = constraints.maxWidth;
        final columns = PlatformUtils.getColumns(screenWidth);
        
        return Consumer<AuthProvider>(
          builder: (context, authProvider, child) {
            return SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Welcome Section
                  _buildWebWelcomeSection(authProvider, screenWidth),
                  
                  const SizedBox(height: 40),
                  
                  // Stats Section
                  _buildWebStatsSection(screenWidth),
                  
                  const SizedBox(height: 40),
                  
                  // Game Classes Section
                  _buildWebGameClassesSection(columns, screenWidth),
                  
                  const SizedBox(height: 40),
                  
                  // Recent Results Section
                  _buildWebRecentResultsSection(screenWidth),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildWebWelcomeSection(AuthProvider authProvider, double screenWidth) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(30),
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
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: PlatformUtils.isLargeScreen(screenWidth)
          ? Row(
              children: [
                Expanded(child: _buildWelcomeContent(authProvider)),
                const SizedBox(width: 40),
                _buildWelcomeImage(),
              ],
            )
          : Column(
              children: [
                _buildWelcomeContent(authProvider),
                const SizedBox(height: 20),
                _buildWelcomeImage(),
              ],
            ),
    );
  }

  Widget _buildWelcomeContent(AuthProvider authProvider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Welcome back, ${authProvider.currentUser?.username ?? 'Player'}!',
          style: GoogleFonts.poppins(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 15),
        Text(
          AppConstants.appTagline,
          style: GoogleFonts.poppins(
            fontSize: 18,
            color: Colors.white.withValues(alpha: 0.9),
          ),
        ),
        const SizedBox(height: 25),
        ElevatedButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.casino, color: AppColors.primary),
          label: const Text(
            'Start Playing',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.primary,
            ),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(25),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildWelcomeImage() {
    return Container(
      width: 200,
      height: 200,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Icon(
        Icons.casino,
        size: 100,
        color: Colors.white,
      ),
    );
  }

  Widget _buildWebStatsSection(double screenWidth) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Your Statistics',
          style: GoogleFonts.poppins(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 20),
        PlatformUtils.isLargeScreen(screenWidth)
            ? Row(
                children: [
                  Expanded(child: _buildStatCard('Games Played', '127', Icons.games, AppColors.info)),
                  const SizedBox(width: 20),
                  Expanded(child: _buildStatCard('Total Wins', '45', Icons.emoji_events, AppColors.success)),
                  const SizedBox(width: 20),
                  Expanded(child: _buildStatCard('Win Rate', '35.4%', Icons.trending_up, AppColors.warning)),
                  const SizedBox(width: 20),
                  Expanded(child: _buildStatCard('Balance', '₹2,450', Icons.account_balance_wallet, AppColors.accent)),
                ],
              )
            : Column(
                children: [
                  Row(
                    children: [
                      Expanded(child: _buildStatCard('Games Played', '127', Icons.games, AppColors.info)),
                      const SizedBox(width: 15),
                      Expanded(child: _buildStatCard('Total Wins', '45', Icons.emoji_events, AppColors.success)),
                    ],
                  ),
                  const SizedBox(height: 15),
                  Row(
                    children: [
                      Expanded(child: _buildStatCard('Win Rate', '35.4%', Icons.trending_up, AppColors.warning)),
                      const SizedBox(width: 15),
                      Expanded(child: _buildStatCard('Balance', '₹2,450', Icons.account_balance_wallet, AppColors.accent)),
                    ],
                  ),
                ],
              ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
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
      child: Column(
        children: [
          Icon(icon, size: 30, color: color),
          const SizedBox(height: 10),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWebGameClassesSection(int columns, double screenWidth) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Game Classes',
          style: GoogleFonts.poppins(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 20),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: columns.clamp(1, 3),
            crossAxisSpacing: 20,
            mainAxisSpacing: 20,
            childAspectRatio: 1.2,
          ),
          itemCount: 3,
          itemBuilder: (context, index) {
            final gameClasses = ['A', 'B', 'C'];
            final colors = [AppColors.classA, AppColors.classB, AppColors.classC];
            final descriptions = [
              '1x3 repeating numbers',
              '2x1 pattern numbers',
              'Unique 3-digit numbers'
            ];
            
            return _buildWebGameClassCard(
              gameClasses[index],
              colors[index],
              descriptions[index],
              screenWidth,
            );
          },
        ),
      ],
    );
  }

  Widget _buildWebGameClassCard(String gameClass, Color color, String description, double screenWidth) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.2),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () {
            // Navigate to game screen
          },
          child: Padding(
            padding: const EdgeInsets.all(25),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: color,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      'Class $gameClass',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 15),
                Text(
                  'Class $gameClass',
                  style: GoogleFonts.poppins(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  description,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 15),
                ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: color,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                  child: const Text(
                    'Play Now',
                    style: TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildWebRecentResultsSection(double screenWidth) {
    final results = MockData.getMockGameResults().take(5).toList();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Recent Results',
          style: GoogleFonts.poppins(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 20),
        Container(
          width: double.infinity,
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
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Latest Game Results',
                      style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    TextButton(
                      onPressed: () {},
                      child: const Text('View All'),
                    ),
                  ],
                ),
              ),
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: results.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final result = results[index];
                  return ListTile(
                    leading: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: _getClassColor(result.gameClass),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          result.gameClass,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    title: Text(
                      'Result: ${result.winningNumber}',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    subtitle: Text(DateFormat('MMM dd, yyyy').format(result.resultDate)),
                    trailing: Text(
                      result.id,
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                      ),
                    ),
                  );
                },
              ),
            ],
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
}

// Keep the original mobile dashboard as fallback
class MobileDashboard extends StatelessWidget {
  const MobileDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    // Return the original dashboard implementation for mobile
    return Container(); // Placeholder - you can import the original dashboard content here
  }
}
