import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/colors.dart';
import '../providers/auth_provider.dart';
import '../providers/game_provider.dart';
import '../widgets/custom_appbar.dart';
import '../widgets/loading_spinner.dart';
import '../utils/utils.dart';
import 'login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.currentUser;

    if (user == null) {
      return const Scaffold(body: Center(child: Text('User not found')));
    }

    return Scaffold(
      appBar: CustomAppBar(
        title: 'Profile',
        walletBalance: user.walletBalance,
        showWallet: true,
      ),
      body: authProvider.isLoading
          ? const Center(child: LoadingSpinner())
          : LayoutBuilder(
              builder: (context, constraints) {
                final screenWidth = constraints.maxWidth;
                final isLargeScreen = screenWidth > 768;
                final contentWidth = isLargeScreen 
                    ? (screenWidth > 1200 ? 800.0 : screenWidth * 0.7)
                    : screenWidth;
                
                return Scrollbar(
                  thumbVisibility: true,
                  trackVisibility: true,
                  child: SingleChildScrollView(
                    padding: EdgeInsets.all(isLargeScreen ? 32 : 16),
                    child: Center(
                      child: Container(
                        width: contentWidth,
                        constraints: BoxConstraints(
                          maxWidth: 800,
                          minHeight: constraints.maxHeight - (isLargeScreen ? 64 : 32),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            SizedBox(height: isLargeScreen ? 30 : 20),
                            CircleAvatar(
                              radius: isLargeScreen ? 80 : 60,
                              backgroundColor: AppColors.primary,
                              child: Text(
                                user.username.substring(0, 1).toUpperCase(),
                                style: TextStyle(
                                  fontSize: isLargeScreen ? 60 : 48,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                            SizedBox(height: isLargeScreen ? 30 : 20),
                            Text(
                              user.username,
                              style: TextStyle(
                                fontSize: isLargeScreen ? 28 : 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              user.email,
                              style: TextStyle(
                                fontSize: isLargeScreen ? 18 : 16,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            SizedBox(height: isLargeScreen ? 50 : 40),
                            _buildInfoCard(context, user, isLargeScreen),
                            SizedBox(height: isLargeScreen ? 32 : 24),
                            _buildActionButtons(context, authProvider, isLargeScreen),
                            SizedBox(height: isLargeScreen ? 40 : 20),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }

  Widget _buildInfoCard(BuildContext context, user, bool isLargeScreen) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(isLargeScreen ? 28 : 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(isLargeScreen ? 20 : 16),
        boxShadow: [
          BoxShadow(
            color: const Color.fromRGBO(128, 128, 128, 0.1),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Account Information',
            style: TextStyle(
              fontSize: isLargeScreen ? 22 : 18, 
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: isLargeScreen ? 20 : 16),
          _buildInfoRow('ID', user.id, isLargeScreen),
          _buildInfoRow('Username', user.username, isLargeScreen),
          _buildInfoRow('Email', user.email, isLargeScreen),
          _buildInfoRow(
            'Token Balance',
            Utils.formatCurrency(user.walletBalance),
            isLargeScreen,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, bool isLargeScreen) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: isLargeScreen ? 12 : 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: TextStyle(
                fontSize: isLargeScreen ? 18 : 16,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              style: TextStyle(
                fontSize: isLargeScreen ? 18 : 16, 
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, AuthProvider authProvider, bool isLargeScreen) {
    final gameProvider = Provider.of<GameProvider>(context);
    final user = authProvider.currentUser;

    return Column(
      children: [
        _buildActionButton(
          icon: Icons.add_card,
          label: 'Add Tokens (Mock)',
          color: AppColors.success,
          isLargeScreen: isLargeScreen,
          onTap: () async {
            if (user != null) {
              await authProvider.updateWalletBalance(500);
              Utils.showToast('Added 500 Tokens (Mock)');
            }
          },
        ),
        SizedBox(height: isLargeScreen ? 16 : 12),
        _buildActionButton(
          icon: Icons.refresh,
          label: 'Reset Mock Data',
          color: AppColors.warning,
          isLargeScreen: isLargeScreen,
          onTap: () async {
            if (user != null) {
              await gameProvider.resetMockData(user.id);
              Utils.showToast('Mock data has been reset');
            }
          },
        ),
        SizedBox(height: isLargeScreen ? 16 : 12),
        _buildActionButton(
          icon: Icons.logout,
          label: 'Logout',
          color: AppColors.error,
          isLargeScreen: isLargeScreen,
          onTap: () async {
            await authProvider.logout();
            if (context.mounted) {
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (context) => const LoginScreen()),
                (route) => false,
              );
            }
          },
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
    required bool isLargeScreen,
  }) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: onTap,
        icon: Icon(icon, size: isLargeScreen ? 24 : 20),
        label: Text(
          label,
          style: TextStyle(
            fontSize: isLargeScreen ? 18 : 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          padding: EdgeInsets.symmetric(
            vertical: isLargeScreen ? 18 : 16,
            horizontal: isLargeScreen ? 24 : 16,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(isLargeScreen ? 12 : 10),
          ),
        ),
      ),
    );
  }
}
