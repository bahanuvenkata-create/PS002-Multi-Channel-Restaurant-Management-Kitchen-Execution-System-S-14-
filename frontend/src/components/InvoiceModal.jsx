import { Printer, X, CheckCircle, Download } from 'lucide-react';

export default function InvoiceModal({ isOpen, onClose, invoice }) {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return new Date().toLocaleString();
    try {
      return new Date(isoStr).toLocaleString();
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-gray-900 rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative my-8 print:p-0 print:m-0 print:shadow-none print:w-full">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors print:hidden"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-md">
              B
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">BistroByte Hospitality</h1>
              <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Tax Invoice / Receipt</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice Number</span>
            <p className="text-lg font-black text-orange-600 font-mono">{invoice.invoiceNumber || 'INV-BB-' + invoice.orderNumber}</p>
            <p className="text-xs text-gray-500 mt-1">{formatDate(invoice.orderDate)}</p>
          </div>
        </div>

        {/* Customer & Restaurant Meta */}
        <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-2xl mb-6 text-sm">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Billed To (Customer)</p>
            <p className="font-bold text-gray-900">{invoice.customerName || 'Guest Customer'}</p>
            {invoice.customerEmail && <p className="text-gray-600 text-xs">{invoice.customerEmail}</p>}
            {invoice.customerPhone && <p className="text-gray-600 text-xs">{invoice.customerPhone}</p>}
            {invoice.deliveryAddress && <p className="text-gray-600 text-xs mt-1">{invoice.deliveryAddress}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Fulfilled By</p>
            <p className="font-bold text-gray-900">{invoice.restaurantName || 'BistroByte Kitchen Partner'}</p>
            <div className="flex items-center justify-end gap-1 mt-2 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full inline-flex">
              <CheckCircle size={14} /> Payment {invoice.paymentStatus || 'SUCCESS'} ({invoice.paymentMethod || 'UPI'})
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-semibold text-gray-800">{item.itemName || item.name || 'Dish'}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-gray-600">₹{(item.price || 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">₹{((item.subtotal || item.price * item.quantity) || 0).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400">Order package items</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Totals */}
        <div className="w-full flex justify-end mb-8">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-semibold">₹{(invoice.subtotal || invoice.totalAmount * 0.9).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST / Taxes (5%):</span>
              <span className="font-semibold">₹{(invoice.tax || invoice.totalAmount * 0.05).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee:</span>
              <span className="font-semibold">₹{(invoice.deliveryFee !== undefined ? invoice.deliveryFee : 2.99).toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount:</span>
                <span>-₹{invoice.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2 flex justify-between text-base font-black text-gray-900">
              <span>Grand Total:</span>
              <span className="text-orange-600 font-mono">₹{(invoice.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 print:hidden border-t border-gray-200 pt-6">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Printer size={18} /> Print / Save PDF
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
