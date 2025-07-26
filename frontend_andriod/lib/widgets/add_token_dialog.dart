import 'package:flutter/material.dart';

class AddTokenDialog extends StatefulWidget {
  final String qrImageUrl;
  final Function(int amount, String upiId, String userName, String paymentApp)
  onSubmit;
  const AddTokenDialog({
    super.key,
    required this.qrImageUrl,
    required this.onSubmit,
  });

  @override
  State<AddTokenDialog> createState() => _AddTokenDialogState();
}

class _AddTokenDialogState extends State<AddTokenDialog> {
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _upiController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  String _selectedApp = 'GooglePay';

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Tokens'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset('assets/images/app_icon.png', height: 120),
            const SizedBox(height: 12),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Enter Amount (Tokens)',
                suffixText: 'Tokens',
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _upiController,
              decoration: const InputDecoration(labelText: 'Enter UPI ID'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Name of User'),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _selectedApp,
              items: const [
                DropdownMenuItem(value: 'GooglePay', child: Text('Google Pay')),
                DropdownMenuItem(value: 'PhonePe', child: Text('PhonePe')),
                DropdownMenuItem(value: 'Paytm', child: Text('Paytm')),
              ],
              onChanged: (val) =>
                  setState(() => _selectedApp = val ?? 'GooglePay'),
              decoration: const InputDecoration(
                labelText: 'Select Payment App',
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () {
            final amount = int.tryParse(_amountController.text) ?? 0;
            final upi = _upiController.text.trim();
            final name = _nameController.text.trim();
            if (amount > 0 && upi.isNotEmpty && name.isNotEmpty) {
              widget.onSubmit(amount, upi, name, _selectedApp);
              Navigator.pop(context);
            }
          },
          child: const Text('Add Token'),
        ),
      ],
    );
  }
}
