import React, { useState } from 'react';
import { 
  Search, Clock, MapPin, Phone, Send, Radio, 
  AlertTriangle, CheckCircle, Filter,
  Eye, Trash2, RefreshCw, X
} from 'lucide-react';
import { alertService } from "../../services/alertService";
import { SOSMiniMap } from "./SOSMiniMap";

export const SOSDispatch = ({ dispatches, setDispatches }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update dispatch status
  const handleUpdateStatus = async (id, newStatus) => {
    setLoading(true);
    try {
      setDispatches((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      await alertService.updateAlertStatus(id, newStatus);
    } catch (e) {
      console.error('Failed to update alert status', e);
    } finally {
      setLoading(false);
    }
  };

  // Delete dispatch
  const handleDeleteDispatch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this SOS alert record?')) return;
    
    setLoading(true);
    try {
      setDispatches((prev) => prev.filter((item) => item.id !== id));
      await alertService.deleteAlert(id);
    } catch (e) {
      console.error('Failed to delete alert', e);
    } finally {
      setLoading(false);
    }
  };

  // Refresh dispatches
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const alertsData = await alertService.getAlerts();
      const mappedDispatches = alertsData.map((a, idx) => ({
        id: a._id || a.id || `DISP-${8900 + idx}`,
        victimName: a.victimName || a.user?.name || 'Emergency Caller',
        victimPhone: a.victimPhone || a.user?.phone || '+977 9841-382910',
        bloodGroup: a.bloodGroup || a.user?.bloodGroup || 'O+',
        medicalNotes: a.medicalNotes || a.user?.medicalNotes || 'No medical notes',
        location: a.address || a.location || 'Kathmandu, Nepal',
        triggeredAt: a.createdAt || a.timestamp || new Date().toISOString(),
        status: a.status || 'Active',
        type: a.type || 'SOS Alert',
        guardianCount: a.recipientsCount || 2,
        duressActivated: !!a.duressActivated,
        ipLog: a.ipLog || '127.0.0.1',
        latitude: a.lat ? Number(a.lat) : 27.7172,
        longitude: a.lng ? Number(a.lng) : 85.3240,
      }));
      setDispatches(mappedDispatches);
    } catch (e) {
      console.error('Failed to refresh alerts', e);
    } finally {
      setLoading(false);
    }
  };

  // Filtered dispatches
  const filteredDispatches = dispatches.filter((item) => {
    const matchesSearch =
      item.victimName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.victimPhone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get status styling
  const getStatusConfig = (status) => {
    const configs = {
      'Active': {
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: <Radio className="w-3 h-3 text-red-600 animate-pulse" />,
        label: 'Active SOS',
      },
      'Unit Dispatched': {
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <Send className="w-3 h-3 text-amber-600" />,
        label: 'Unit Dispatched',
      },
      'Accidental/Prank': {
        color: 'bg-stone-100 text-stone-700 border-stone-200',
        icon: <AlertTriangle className="w-3 h-3 text-stone-600" />,
        label: 'False Alarm',
      },
      'Resolved': {
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle className="w-3 h-3 text-emerald-600" />,
        label: 'Resolved',
      }
    };
    return configs[status] || configs['Active'];
  };

  // View dispatch details
  const viewDetails = (dispatch) => {
    setSelectedDispatch(dispatch);
    setShowDetailsModal(true);
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    try {
      return new Date(timestamp).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-3xl p-5 border border-[#eee0ce] shadow-sm">
          <div className="text-[#814a27]/70 text-[10px] font-extrabold uppercase tracking-wider">Total Alerts</div>
          <div className="text-2xl font-black text-[#2d180c] mt-1 font-mono">{dispatches.length}</div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-[#eee0ce] shadow-sm">
          <div className="text-[#814a27]/70 text-[10px] font-extrabold uppercase tracking-wider">Active SOS</div>
          <div className="text-2xl font-black text-red-600 mt-1 flex items-center gap-2 font-mono">
            {dispatches.filter(d => d.status === 'Active').length}
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-[#eee0ce] shadow-sm">
          <div className="text-[#814a27]/70 text-[10px] font-extrabold uppercase tracking-wider">Dispatched</div>
          <div className="text-2xl font-black text-amber-700 mt-1 font-mono">
            {dispatches.filter(d => d.status === 'Unit Dispatched').length}
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-[#eee0ce] shadow-sm">
          <div className="text-[#814a27]/70 text-[10px] font-extrabold uppercase tracking-wider">Resolved</div>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            {dispatches.filter(d => d.status === 'Resolved').length}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-[#eee0ce] shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-[#814a27]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, phone, or location..."
            className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-2xl pl-10 pr-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133] placeholder-[#814a27]/40"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#814a27]/60" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#fdfbf7] border border-[#eee0ce] text-[#2d180c] font-bold text-xs rounded-2xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#9e6133] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">🔴 Active SOS</option>
              <option value="Unit Dispatched">🚔 Unit Dispatched</option>
              <option value="Accidental/Prank">⚠️ False Alarm</option>
              <option value="Resolved">✅ Resolved</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* SOS Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDispatches.map((item) => {
          const statusConfig = getStatusConfig(item.status);
          const isAlert = item.status === 'Active';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-6 border transition-all space-y-4 shadow-sm hover:shadow-md ${
                isAlert
                  ? 'border-red-300 ring-2 ring-red-100'
                  : item.status === 'Unit Dispatched'
                  ? 'border-amber-300 ring-1 ring-amber-100'
                  : 'border-[#eee0ce]'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[#eee0ce] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#f7f0e6] text-[#9e6133] font-black flex items-center justify-center text-sm border border-[#eee0ce] shadow-xs">
                    {item.victimName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[11px] font-mono font-bold text-[#814a27]/70">{item.id}</div>
                    <h3 className="text-base font-black text-[#2d180c] flex items-center gap-2">
                      {item.victimName}
                      {item.duressActivated && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 rounded-md">
                          🚨 Duress
                        </span>
                      )}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${statusConfig.color}`}>
                    {statusConfig.icon}
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#fdfbf7] p-3 rounded-2xl border border-[#eee0ce] space-y-1">
                  <span className="text-[#814a27]/70 font-bold flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#9e6133]" /> Contact
                  </span>
                  <div className="font-extrabold text-[#2d180c]">{item.victimPhone}</div>
                  <div className="text-rose-600 font-black text-[11px]">🩸 Blood: {item.bloodGroup}</div>
                </div>

                <div className="bg-[#fdfbf7] p-3 rounded-2xl border border-[#eee0ce] space-y-1">
                  <span className="text-[#814a27]/70 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#9e6133]" /> Triggered
                  </span>
                  <div className="font-bold text-[#2d180c]">{getTimeAgo(item.triggeredAt)}</div>
                  <div className="text-[#814a27]/80 text-[11px] font-medium">👥 {item.guardianCount} Guardians Notified</div>
                </div>
              </div>

              {/* Live Location Mini Map */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#814a27] font-bold px-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-600" /> GPS Emergency Location
                  </span>
                  <span className="text-[11px] text-[#814a27]/70 truncate max-w-[220px]">
                    {item.location}
                  </span>
                </div>
                <SOSMiniMap
                  latitude={item.latitude}
                  longitude={item.longitude}
                  locationName={item.location}
                  victimName={item.victimName}
                  status={item.status}
                  height="170px"
                  zoom={15}
                />
              </div>

              {/* Medical Notes */}
              {item.medicalNotes && item.medicalNotes !== 'No medical notes' && (
                <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200 text-xs text-amber-950 font-medium">
                  <strong className="text-amber-900 font-black">🏥 Medical Notes:</strong> {item.medicalNotes}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#eee0ce]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => viewDetails(item)}
                    className="p-2 bg-[#fdfbf7] hover:bg-[#f7f0e6] text-[#2d180c] rounded-xl border border-[#eee0ce] transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                    title="View Full Details"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#9e6133]" />
                    <span>Details</span>
                  </button>

                  <button
                    onClick={() => handleDeleteDispatch(item.id)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'Active' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'Unit Dispatched')}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3 h-3" /> Dispatch Unit
                    </button>
                  )}

                  {item.status !== 'Resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'Resolved')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle className="w-3 h-3" /> Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDispatches.length === 0 && (
        <div className="bg-white rounded-3xl p-12 border border-[#eee0ce] text-center space-y-3 shadow-sm">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-black text-[#2d180c]">No Alerts Found</h3>
          <p className="text-xs text-[#814a27]/70 max-w-sm mx-auto">
            There are no emergency alerts matching your search criteria. All monitored zones are currently secure.
          </p>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDispatch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-[#2d180c] max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#eee0ce] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#f7f0e6] text-[#9e6133] font-black flex items-center justify-center text-lg border border-[#eee0ce]">
                  {selectedDispatch.victimName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[#814a27]/70">{selectedDispatch.id}</div>
                  <h3 className="text-xl font-black text-[#2d180c]">{selectedDispatch.victimName}</h3>
                </div>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="text-[#814a27] hover:text-[#2d180c] p-2 rounded-xl hover:bg-[#f7f0e6] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#fdfbf7] p-3.5 rounded-2xl border border-[#eee0ce]">
                  <div className="text-[#814a27]/70 text-[10px] uppercase font-extrabold">Status</div>
                  <div className="font-black flex items-center gap-2 mt-1 text-[#2d180c]">
                    {getStatusConfig(selectedDispatch.status).icon}
                    {selectedDispatch.status}
                  </div>
                </div>
                <div className="bg-[#fdfbf7] p-3.5 rounded-2xl border border-[#eee0ce]">
                  <div className="text-[#814a27]/70 text-[10px] uppercase font-extrabold">Blood Group</div>
                  <div className="font-black text-rose-600 mt-1">{selectedDispatch.bloodGroup}</div>
                </div>
              </div>

              {/* Interactive Mini-Map */}
              <div className="space-y-1">
                <div className="text-[#814a27] text-[11px] uppercase font-extrabold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-600" /> Live GPS Dispatch Coordinates & Map
                </div>
                <SOSMiniMap
                  latitude={selectedDispatch.latitude}
                  longitude={selectedDispatch.longitude}
                  locationName={selectedDispatch.location}
                  victimName={selectedDispatch.victimName}
                  status={selectedDispatch.status}
                  height="220px"
                  zoom={16}
                />
              </div>

              <div className="bg-[#fdfbf7] p-4 rounded-2xl border border-[#eee0ce] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#814a27]/70 font-bold">📞 Phone Number</span>
                  <span className="font-extrabold text-[#2d180c]">{selectedDispatch.victimPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#814a27]/70 font-bold">📍 Address / Location</span>
                  <span className="font-extrabold text-[#2d180c] text-right">{selectedDispatch.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#814a27]/70 font-bold">⏱️ Triggered Time</span>
                  <span className="font-extrabold text-[#2d180c]">{getTimeAgo(selectedDispatch.triggeredAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#814a27]/70 font-bold">👥 Emergency Guardians</span>
                  <span className="font-extrabold text-[#2d180c]">{selectedDispatch.guardianCount} notified</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-[#eee0ce]">
              <a
                href={`tel:${selectedDispatch.victimPhone}`}
                className="flex-1 bg-[#f7f0e6] hover:bg-[#eee0ce] text-[#2d180c] font-black py-3 px-4 rounded-2xl text-xs text-center transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#eee0ce]"
              >
                <Phone className="w-4 h-4 text-emerald-600" /> Call Victim
              </a>
              
              {selectedDispatch.status === 'Active' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedDispatch.id, 'Unit Dispatched');
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 bg-[#9e6133] hover:bg-[#814a27] text-white font-black py-3 px-4 rounded-2xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#9e6133]/25 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Dispatch Unit
                </button>
              )}
              
              {selectedDispatch.status !== 'Resolved' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedDispatch.id, 'Resolved');
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-2xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <CheckCircle className="w-4 h-4" /> Resolve Case
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};