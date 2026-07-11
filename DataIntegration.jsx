import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useTenant } from "@/components/layout/TenantContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Database, UploadCloud, Users, FileText, FileSpreadsheet, 
  Receipt, History, CheckCircle2, AlertTriangle, Loader2, ArrowRight 
} from "lucide-react";
import { toast } from "sonner";

// Dark-themed Bento Section matching your system style
function BentoCard({ title, subtitle, icon: Icon, children, className = "" }) {
  return (
    <div className={`bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        {Icon && <Icon className="w-5 h-5 text-indigo-400 shrink-0" />}
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

const IMPORT_TYPES = [
  { id: "customers", label: "Customers & Contacts", icon: Users, desc: "Accounts, billing details, and contact lists" },
  { id: "quotes", label: "Quotes & Estimates", icon: FileSpreadsheet, desc: "Pending proposals and historical client estimates" },
  { id: "invoices", label: "Sales Invoices", icon: FileText, desc: "Open, paid, and outstanding client invoices" },
  { id: "expenses", label: "Expenses & Bills", icon: Receipt, desc: "Vendor payments and operational expenses" },
];

const SOURCES = [
  { id: "quickbooks", label: "QuickBooks Online", type: "api" },
  { id: "netsuite", label: "Oracle NetSuite", type: "api" },
  { id: "patriot", label: "Patriot Software", type: "file" },
  { id: "csv", label: "Universal CSV / Excel Template", type: "file" },
];

export default function DataIntegration() {
  const { tenant } = useTenant();
  const [selectedType, setSelectedType] = useState("customers");
  const [selectedSource, setSelectedSource] = useState("quickbooks");
  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState(null);

  const currentSource = SOURCES.find(s => s.id === selectedSource);

  // Mock historical log data following your standard badge setups
  const [logs] = useState([
    { id: "1", date: "2026-07-11", type: "Sales Invoices", source: "QuickBooks Online", count: 84, status: "completed" },
    { id: "2", date: "2026-07-10", type: "Customers & Contacts", source: "Patriot Software", count: 142, status: "completed" },
    { id: "3", date: "2026-07-08", type: "Quotes & Estimates", source: "Universal CSV", count: 0, status: "failed", error: "Invalid date column format" },
  ]);

  const handleExecuteImport = async () => {
    setImporting(true);
    try {
      // Tieing cleanly into your serverless function framework
      const response = await base44.functions.invoke("processFinancialIngestion", {
        tenant_id: tenant?.id,
        import_type: selectedType,
        source: selectedSource,
        mode: currentSource?.type === "api" ? "oauth_sync" : "file_ingest",
        file_name: file ? file.name : null
      });

      if (response.error) throw new Error(response.error);

      toast.success(`${IMPORT_TYPES.find(t => t.id === selectedType).label} sync initialized successfully.`);
      setFile(null);
    } catch (err) {
      toast.error(err.message || "Ingestion alignment failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
      {/* Title Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-500" /> DATA INTEGRATION
        </h1>
        <p className="text-sm text-slate-400 uppercase tracking-wider">
          Ingest structural accounting data, records, records history, and customer channels into the ERP matrix
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bento Card 1: Select Records Target */}
        <BentoCard 
          title="1. Select Data Type" 
          subtitle="Pick the target financial dataset to align" 
          icon={Database}
          className="lg:col-span-1"
        >
          <div className="space-y-3">
            {IMPORT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <div
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-start gap-4 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-900/20" 
                      : "bg-slate-900/30 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold tracking-wide">{type.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{type.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </BentoCard>

        {/* Bento Card 2: Configuration & Upload Pipeline */}
        <BentoCard 
          title="2. Connection & Execution" 
          subtitle="Determine operational pipeline feeds" 
          icon={UploadCloud}
          className="lg:col-span-2 flex flex-col justify-between"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Source</label>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {SOURCES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pipeline Connection Method</label>
                <div className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-800/40 flex items-center text-sm font-semibold text-slate-300">
                  {currentSource?.type === "api" ? "Direct API OAuth Stream" : "Manual Spreadsheet Data Mapper"}
                </div>
              </div>
            </div>

            {/* Ingestion UI Conditional Split */}
            {currentSource?.type === "api" ? (
              <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4 flex items-start gap-3">
                <Database className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Authenticated Direct Link Enabled</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Nexus ERP will use authenticated secure background channels to systematically ingest records matching your criteria.
                  </p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-900/20 hover:bg-slate-900/40 transition-colors relative cursor-pointer group">
                <input 
                  type="file" 
                  accept=".csv,.xlsx"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 transition-colors mb-2" />
                <p className="text-sm font-bold text-slate-300">
                  {file ? file.name : "Drag & drop export template here"}
                </p>
                <p className="text-xs text-slate-500 mt-1">Supports standard CSV or XLSX data structures</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-4 mt-6 flex items-center justify-end">
            <Button 
              onClick={handleExecuteImport} 
              disabled={importing || (currentSource?.type === "file" && !file)}
              className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold px-5 gap-2"
            >
              {importing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Ingesting Data...</>
              ) : (
                <><ArrowRight className="w-4 h-4" /> Run Ingestion Engine</>
              )}
            </Button>
          </div>
        </BentoCard>
      </div>

      {/* Bento Card 3: Historical Audit Trail Log Table */}
      <BentoCard title="Data Ingestion Audit Trail Log" subtitle="Verifiable historical operational execution logs" icon={History}>
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3.5">Sync Date</th>
                <th className="p-3.5">Record Target Set</th>
                <th className="p-3.5">Origin Source</th>
                <th className="p-3.5 text-right">Records Ingested</th>
                <th className="p-3.5 pl-6">Execution Health</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800/60 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="p-3.5 font-mono text-xs">{log.date}</td>
                  <td className="p-3.5 font-bold text-white">{log.type}</td>
                  <td className="p-3.5 text-slate-400">{log.source}</td>
                  <td className="p-3.5 text-right font-mono text-xs font-semibold">{log.count} records</td>
                  <td className="p-3.5 pl-6">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        {log.status === "completed" ? (
                          <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs font-semibold text-emerald-400">Success</span></>
                        ) : (
                          <><AlertTriangle className="w-3.5 h-3.5 text-red-400" /><span className="text-xs font-semibold text-red-400">Failed</span></>
                        )}
                      </div>
                      {log.error && <span className="text-[11px] text-red-400/80 font-medium">{log.error}</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BentoCard>
    </div>
  );
}