import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/wallet_service.dart';
import '../utils/utils.dart';

class AddTokenDialog extends StatefulWidget {
  const AddTokenDialog({super.key});

  @override
  State<AddTokenDialog> createState() => _AddTokenDialogState();
}

class _AddTokenDialogState extends State<AddTokenDialog> {
  final WalletService _walletService = WalletService();
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _upiIdController = TextEditingController();
  final TextEditingController _userNameController = TextEditingController();
  final TextEditingController _phoneNumberController = TextEditingController();
  final TextEditingController _referralNumberController =
      TextEditingController();

  String _selectedApp = 'GooglePay';
  bool _isLoading = false;
  String? _qrImageUrl;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  @override
  void dispose() {
    _amountController.dispose();
    _upiIdController.dispose();
    _userNameController.dispose();
    _phoneNumberController.dispose();
    _referralNumberController.dispose();
    super.dispose();
  }

  Future<void> _loadUserData() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.currentUser;

    if (user != null) {
      _userNameController.text = user.username ?? '';
      _phoneNumberController.text = user.mobileNumber ?? '';
    }
  }

  Future<void> _generateQRCode() async {
    if (_amountController.text.isEmpty) {
      Utils.showToast('Please enter amount first', isError: true);
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final amount = double.parse(_amountController.text);
      final response = await _walletService.generateQRCode(
        amount: amount,
        paymentApp: _selectedApp,
        upiId: _upiIdController.text,
      );

      if (response['success'] == true && response['qrCode'] != null) {
        setState(() {
          _qrImageUrl = response['qrCode']['imageUrl'];
        });
      }
    } catch (e) {
      Utils.showToast('Failed to generate QR code', isError: true);
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _submitRequest() async {
    if (_amountController.text.isEmpty ||
        _upiIdController.text.isEmpty ||
        _userNameController.text.isEmpty ||
        _phoneNumberController.text.isEmpty ||
        _referralNumberController.text.isEmpty) {
      Utils.showToast('Please fill all required fields', isError: true);
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final amount = double.parse(_amountController.text);

      final response = await _walletService.requestAddBalance(
        amount: amount,
        upiId: _upiIdController.text,
        userName: _userNameController.text,
        paymentApp: _selectedApp,
        referralNumber: _referralNumberController.text,
        phoneNumber: _phoneNumberController.text,
      );

      if (response['success'] == true) {
        Navigator.of(context).pop(true);
        Utils.showToast('Add balance request submitted successfully');
      }
    } catch (e) {
      Utils.showToast('Failed to submit request', isError: true);
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Balance'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // QR Code Section
            if (_qrImageUrl != null)
              Container(
                height: 150,
                width: 150,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Image.network(
                  _qrImageUrl!,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) {
                    return const Icon(Icons.error, size: 50);
                  },
                ),
              )
            else
              Container(
                height: 150,
                width: 150,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(
                  child: Text(
                    'QR Code will appear here',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              ),
            const SizedBox(height: 16),

            // Amount Field
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Enter Amount *',
                border: OutlineInputBorder(),
                prefixText: '₹ ',
              ),
            ),
            const SizedBox(height: 12),

            // Generate QR Button
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _generateQRCode,
              icon: const Icon(Icons.qr_code),
              label: const Text('Generate QR Code'),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 45),
              ),
            ),
            const SizedBox(height: 16),

            // Payment App Dropdown
            DropdownButtonFormField<String>(
              value: _selectedApp,
              decoration: const InputDecoration(
                labelText: 'Payment App *',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'GooglePay', child: Text('Google Pay')),
                DropdownMenuItem(value: 'PhonePe', child: Text('PhonePe')),
                DropdownMenuItem(value: 'Paytm', child: Text('Paytm')),
                DropdownMenuItem(value: 'BHIM', child: Text('BHIM UPI')),
                DropdownMenuItem(value: 'Other', child: Text('Other')),
              ],
              onChanged: (value) {
                setState(() {
                  _selectedApp = value!;
                });
              },
            ),
            const SizedBox(height: 12),

            // UPI ID Field
            TextField(
              controller: _upiIdController,
              decoration: const InputDecoration(
                labelText: 'UPI ID *',
                border: OutlineInputBorder(),
                hintText: 'your-upi@bank',
              ),
            ),
            const SizedBox(height: 12),

            // User Name Field
            TextField(
              controller: _userNameController,
              decoration: const InputDecoration(
                labelText: 'Full Name *',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),

            // Phone Number Field
            TextField(
              controller: _phoneNumberController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Phone Number *',
                border: OutlineInputBorder(),
                prefixText: '+91 ',
              ),
            ),
            const SizedBox(height: 12),

            // Referral Number Field
            TextField(
              controller: _referralNumberController,
              decoration: const InputDecoration(
                labelText: 'Referral Number *',
                border: OutlineInputBorder(),
                hintText: 'REF12345',
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _submitRequest,
          child: _isLoading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Submit Request'),
        ),
      ],
    );
  }
}
