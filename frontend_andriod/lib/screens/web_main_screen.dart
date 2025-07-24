import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/responsive_layout.dart';
import '../utils/platform_utils.dart';
import '../constants/colors.dart';
import '../widgets/web_navigation.dart';
import '../screens/dashboard_screen.dart';
import '../screens/results_screen.dart';
import '../screens/history_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/login_screen.dart';

class WebMainScreen extends StatefulWidget {
  const WebMainScreen({super.key});

  @override
  State<WebMainScreen> createState() => _WebMainScreenState();
}

class _WebMainScreenState extends State<WebMainScreen> {
  int _currentIndex = 0;
  
  final List<String> _menuItems = [
    'Dashboard',
    'Results', 
    'History',
    'Profile'
  ];

  final List<Widget> _screens = [
    const DashboardScreen(),
    const ResultsScreen(),
    const HistoryScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        // Show loading spinner while loading
        if (authProvider.isLoading) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        if (!authProvider.isLoggedIn) {
          return const LoginScreen();
        }

        return ResponsiveBuilder(
          builder: (context, constraints) {
            final screenWidth = constraints.maxWidth;
            final padding = PlatformUtils.getScreenPadding(screenWidth);
            
            return Scaffold(
              body: Row(
                children: [
                  // Left Navigation Panel for larger screens
                  if (PlatformUtils.isMediumScreen(screenWidth) || 
                      PlatformUtils.isLargeScreen(screenWidth))
                    WebNavigationPanel(
                      currentIndex: _currentIndex,
                      onItemTap: (index) => setState(() => _currentIndex = index),
                      menuItems: _menuItems,
                    ),
                  
                  // Main Content Area
                  Expanded(
                    child: Column(
                      children: [
                        // Top Navigation Bar
                        WebTopNavigationBar(
                          title: _menuItems[_currentIndex],
                          showMenuButton: !PlatformUtils.isMediumScreen(screenWidth) && 
                                         !PlatformUtils.isLargeScreen(screenWidth),
                          onMenuTap: () => _showMobileMenu(context),
                        ),
                        
                        // Content
                        Expanded(
                          child: Container(
                            padding: padding,
                            child: _screens[_currentIndex],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showMobileMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.primary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: _menuItems.asMap().entries.map((entry) {
            final index = entry.key;
            final item = entry.value;
            return ListTile(
              leading: Icon(
                _getIconForIndex(index),
                color: _currentIndex == index ? AppColors.accent : Colors.white70,
              ),
              title: Text(
                item,
                style: TextStyle(
                  color: _currentIndex == index ? AppColors.accent : Colors.white,
                  fontWeight: _currentIndex == index ? FontWeight.bold : FontWeight.normal,
                ),
              ),
              onTap: () {
                setState(() => _currentIndex = index);
                Navigator.pop(context);
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  IconData _getIconForIndex(int index) {
    switch (index) {
      case 0: return Icons.dashboard;
      case 1: return Icons.bar_chart;
      case 2: return Icons.history;
      case 3: return Icons.person;
      default: return Icons.dashboard;
    }
  }
}
