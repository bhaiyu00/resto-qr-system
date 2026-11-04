import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Plus,
  Printer,
  Download,
  ExternalLink,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext.tsx';

interface TableWithQR {
  id: string;
  tableNumber: string;
  tableToken: string;
  capacity: number;
  location: string;
  isActive: boolean;
  qrUrl: string;
  qrDataUrl?: string;
}

export const AdminTablesPage: React.FC = () => {
  const { restaurant } = useAdminAuth();
  const [tables, setTables] = useState<TableWithQR[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Standee Modal State
  const [selectedTable, setSelectedTable] = useState<TableWithQR | null>(null);

  // Add Table Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTable, setNewTable] = useState({
    tableNumber: 'Table 09',
    capacity: 4,
    location: 'Main Dining',
  });

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/admin/tables', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const rawTables: TableWithQR[] = data.tables || [];

        // Generate QR Code data URLs for each table
        const withQR = await Promise.all(
          rawTables.map(async t => {
            const fullUrl = `${window.location.origin}${t.qrUrl}`;
            try {
              const qrDataUrl = await QRCode.toDataURL(fullUrl, {
                width: 320,
                margin: 2,
                color: {
                  dark: '#2A1A12',
                  light: '#FAF7F2',
                },
              });
              return { ...t, qrDataUrl };
            } catch {
              return t;
            }
          })
        );
        setTables(withQR);
      }
    } catch (err) {
      console.error('Failed to load tables:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newTable),
      });
      if (res.ok) {
        setIsAddOpen(false);
        fetchTables();
      }
    } catch (err) {
      console.error('Failed to add table:', err);
    }
  };

  const toggleTableStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/tables/${id}/toggle-status`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (res.ok) {
        setTables(prev =>
          prev.map(t => (t.id === id ? { ...t, isActive: !t.isActive } : t))
        );
      }
    } catch (err) {
      console.error('Failed to toggle table status:', err);
    }
  };

  const copyUrl = (table: TableWithQR) => {
    const fullUrl = `${window.location.origin}${table.qrUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(table.tableToken);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const downloadQR = (table: TableWithQR) => {
    if (!table.qrDataUrl) return;
    const a = document.createElement('a');
    a.href = table.qrDataUrl;
    a.download = `cozybite-${table.tableNumber.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    a.click();
  };

  const printStandee = (table: TableWithQR) => {
    const printWindow = window.open('', '_blank', 'width=520,height=750');
    if (!printWindow) return;

    const fullUrl = `${window.location.origin}${table.qrUrl}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table Standee - ${table.tableNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Plus+Jakarta+Sans:wght@500;700&display=swap');
            body {
              margin: 0;
              padding: 24px;
              background: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: 'Plus Jakarta Sans', sans-serif;
              color: #2D1E16;
            }
            .standee-card {
              width: 340px;
              border: 3px solid #2D1E16;
              border-radius: 24px;
              padding: 32px 24px;
              text-align: center;
              background: #FAF7F2;
              box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            }
            .badge {
              display: inline-block;
              background: #C85A32;
              color: #fff;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              padding: 4px 12px;
              border-radius: 12px;
              margin-bottom: 12px;
            }
            .brand {
              font-family: 'Fraunces', serif;
              font-size: 26px;
              font-weight: 700;
              margin: 0 0 4px 0;
              color: #2D1E16;
            }
            .tagline {
              font-size: 12px;
              color: #7E6A5E;
              margin-bottom: 20px;
            }
            .qr-wrapper {
              background: #fff;
              padding: 16px;
              border-radius: 20px;
              display: inline-block;
              border: 1px solid #E5DCD3;
              margin-bottom: 16px;
            }
            .qr-wrapper img {
              width: 220px;
              height: 220px;
              display: block;
            }
            .table-highlight {
              font-family: 'Fraunces', serif;
              font-size: 32px;
              font-weight: 700;
              color: #C85A32;
              margin: 8px 0;
            }
            .location-text {
              font-size: 12px;
              font-weight: 600;
              color: #55443B;
              margin-bottom: 12px;
            }
            .instructions {
              font-size: 11px;
              color: #7E6A5E;
              line-height: 1.5;
              border-top: 1px dashed #D6C8BD;
              padding-top: 12px;
              margin-top: 12px;
            }
            @media print {
              body { padding: 0; }
              .standee-card { box-shadow: none; border-color: #000; }
            }
          </style>
        </head>
        <body>
          <div class="standee-card">
            <span class="badge">Contactless Dining</span>
            <h1 class="brand">${restaurant?.name || 'CozyBite Café'}</h1>
            <p class="tagline">Scan with your smartphone camera</p>
            <div class="qr-wrapper">
              <img src="${table.qrDataUrl}" alt="${table.tableNumber} QR Code" />
            </div>
            <div class="table-highlight">${table.tableNumber}</div>
            <div class="location-text">Zone: ${table.location} · Seats ${table.capacity}</div>
            <div class="instructions">
              Point phone camera to browse the menu, customize dishes, and order directly to this table.
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <QrCode className="w-6 h-6 text-[#E07A5F]" />
            <span>Table Standees & Unique QR Codes</span>
          </h2>
          <p className="text-xs text-[#A8988D] mt-0.5">
            Every dining table has an encrypted, server-verified token. Customers are automatically placed at their scanned table.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B34E29] text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Table</span>
        </button>
      </div>

      {/* Tables Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#8E7E74]">Loading tables and generating QR codes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tables.map(table => (
            <div
              key={table.id}
              className={`bg-[#201815] rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                table.isActive ? 'border-[#362B25] hover:border-[#4B3B32]' : 'border-red-950/60 opacity-60'
              }`}
            >
              <div>
                {/* Header: Table Number & Status Toggle */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <h3 className="font-display font-bold text-lg text-white">
                      {table.tableNumber}
                    </h3>
                  </div>
                  <button
                    onClick={() => toggleTableStatus(table.id)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                      table.isActive
                        ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800'
                        : 'bg-red-950/50 text-red-400 border-red-800'
                    }`}
                  >
                    {table.isActive ? 'Active' : 'Closed'}
                  </button>
                </div>

                {/* Table Meta */}
                <div className="flex items-center gap-3 text-xs text-[#8E7E74] mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#E07A5F]" />
                    <span>{table.location}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#E07A5F]" />
                    <span>{table.capacity} Guests</span>
                  </span>
                </div>

                {/* QR Code Container */}
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E3D7CB] flex flex-col items-center justify-center mb-4">
                  {table.qrDataUrl ? (
                    <img
                      src={table.qrDataUrl}
                      alt={`${table.tableNumber} QR Code`}
                      className="w-36 h-36 object-contain"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center text-xs text-stone-500">
                      Generating QR...
                    </div>
                  )}
                  <span className="text-[10px] font-mono text-[#78665B] mt-1.5 font-semibold">
                    {table.tableToken}
                  </span>
                </div>
              </div>

              {/* Table Actions */}
              <div className="space-y-2 pt-2 border-t border-[#2C211B]">
                {/* Standee Print & Download Row */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => printStandee(table)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#281F1A] hover:bg-[#342721] text-xs font-semibold text-[#D5C5B8] hover:text-white transition-colors border border-[#3E3028]"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#E07A5F]" />
                    <span>Print Standee</span>
                  </button>

                  <button
                    onClick={() => downloadQR(table)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#281F1A] hover:bg-[#342721] text-xs font-semibold text-[#D5C5B8] hover:text-white transition-colors border border-[#3E3028]"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Save PNG</span>
                  </button>
                </div>

                {/* Test Customer Menu Link (Directly tests table token!) */}
                <div className="flex items-center gap-2">
                  <a
                    href={table.qrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#C85A32]/10 hover:bg-[#C85A32]/20 text-[#E07A5F] text-[11px] font-semibold border border-[#C85A32]/30 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test Table Menu</span>
                  </a>

                  <button
                    onClick={() => copyUrl(table)}
                    className="p-1.5 rounded-xl bg-[#281F1A] hover:bg-[#342721] text-[#A69588] hover:text-white border border-[#3E3028] transition-colors"
                    title="Copy QR URL"
                  >
                    {copiedToken === table.tableToken ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Table Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#211915] rounded-2xl border border-[#3A2D25] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[#362B25] flex items-center justify-between">
              <h3 className="font-display font-bold text-white text-lg">Add New Dining Table</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-[#8E7E74] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTable} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#D3C3B6] mb-1">
                  Table Number / Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTable.tableNumber}
                  onChange={e => setNewTable({ ...newTable, tableNumber: e.target.value })}
                  placeholder="e.g. Table 09"
                  className="w-full px-3 py-2 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white text-xs focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#D3C3B6] mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newTable.capacity}
                    onChange={e => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white text-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D3C3B6] mb-1">
                    Dining Zone
                  </label>
                  <input
                    type="text"
                    value={newTable.location}
                    onChange={e => setNewTable({ ...newTable, location: e.target.value })}
                    placeholder="e.g. Balcony, Courtyard"
                    className="w-full px-3 py-2 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white text-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#362B25] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#281F1A] text-xs font-medium text-[#A8988D] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B34E29] text-white text-xs font-semibold shadow-md"
                >
                  Create Table & Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
