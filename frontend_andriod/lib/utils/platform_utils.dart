import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class PlatformUtils {
  static bool get isWeb => kIsWeb;
  static bool get isMobile => !kIsWeb;
  
  static bool isLargeScreen(double width) => width > 1200;
  static bool isMediumScreen(double width) => width > 768 && width <= 1200;
  static bool isSmallScreen(double width) => width <= 768;
  
  static int getColumns(double width) {
    if (width > 1200) return 4;
    if (width > 900) return 3;
    if (width > 600) return 2;
    return 1;
  }
  
  static double getCardWidth(double screenWidth) {
    if (screenWidth > 1200) return 280;
    if (screenWidth > 900) return 240;
    if (screenWidth > 600) return 200;
    return screenWidth * 0.8;
  }
  
  static EdgeInsets getScreenPadding(double width) {
    if (width > 1200) return const EdgeInsets.symmetric(horizontal: 120, vertical: 40);
    if (width > 768) return const EdgeInsets.symmetric(horizontal: 60, vertical: 30);
    return const EdgeInsets.symmetric(horizontal: 20, vertical: 20);
  }
}
