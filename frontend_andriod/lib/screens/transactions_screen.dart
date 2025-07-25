import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../constants/colors.dart';
import '../models/wallet_transaction_model.dart';
import '../providers/auth_provider.dart';
import '../services/user_service.dart';
import '../widgets/custom_appbar.dart';
import '../widgets/loading_spinner.dart';
import '../utils/utils.dart';

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  final UserService _userService = UserService();
  bool _isLoading = false;
  List<WalletTransaction> _transactions = [];
  int _page = 1;
  final int _limit = 20;
  int _totalTransactions = 0;
  bool _hasMoreData = true;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadTransactions();
    _scrollController.addListener(_scrollListener);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_scrollListener);
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollListener() {
    if (_scrollController.position.pixels ==
        _scrollController.position.maxScrollExtent) {
      if (_hasMoreData && !_isLoading) {
        _loadMoreTransactions();
      }
    }
  }

  Future<void> _loadTransactions() async {
    if (_isLoading) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final response = await _userService.getWalletTransactions(
        page: _page,
        limit: _limit,
      );

      final result = WalletTransactionResponse.fromJson(response);

      setState(() {
        _transactions = result.transactions;
        _totalTransactions = result.total;
        _hasMoreData = result.transactions.length < result.total;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      Utils.showToast('Failed to load transactions', isError: true);
    }
  }

  Future<void> _loadMoreTransactions() async {
    if (_isLoading) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final response = await _userService.getWalletTransactions(
        page: _page + 1,
        limit: _limit,
      );

      final result = WalletTransactionResponse.fromJson(response);

      setState(() {
        _transactions.addAll(result.transactions);
        _page++;
        _hasMoreData = (_page * _limit) < result.total;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      Utils.showToast('Failed to load more transactions', isError: true);
    }
  }

  Future<void> _refresh() async {
    setState(() {
      _page = 1;
      _transactions = [];
    });
    await _loadTransactions();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.currentUser;

    if (user == null) {
      return const Scaffold(body: Center(child: Text('User not found')));
    }

    return Scaffold(
      appBar: CustomAppBar(
        title: 'Wallet Transactions',
        walletBalance: user.walletBalance,
        showWallet: true,
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: _isLoading && _transactions.isEmpty
            ? const Center(child: LoadingSpinner())
            : _transactions.isEmpty
            ? const Center(child: Text('No transactions found'))
            : Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      'Total Transactions: $_totalTransactions',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      controller: _scrollController,
                      itemCount: _transactions.length + (_hasMoreData ? 1 : 0),
                      padding: const EdgeInsets.all(8),
                      itemBuilder: (context, index) {
                        if (index == _transactions.length) {
                          return const Center(
                            child: Padding(
                              padding: EdgeInsets.all(16.0),
                              child: CircularProgressIndicator(),
                            ),
                          );
                        }
                        return _buildTransactionItem(_transactions[index]);
                      },
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildTransactionItem(WalletTransaction transaction) {
    final bool isCredit = transaction.type.toLowerCase() == 'credit';
    final Color statusColor = _getStatusColor(transaction.status);
    final String formattedDate = DateFormat(
      'dd MMM yyyy, hh:mm a',
    ).format(transaction.timestamp);

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    transaction.description,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: statusColor),
                  ),
                  child: Text(
                    transaction.status,
                    style: TextStyle(
                      color: statusColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  formattedDate,
                  style: TextStyle(color: Colors.grey[600], fontSize: 14),
                ),
                Text(
                  (isCredit ? '+' : '-') +
                      Utils.formatCurrency(transaction.amount),
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: isCredit ? AppColors.success : AppColors.error,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return AppColors.success;
      case 'pending':
        return AppColors.warning;
      case 'failed':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }
}
