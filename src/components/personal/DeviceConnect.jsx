import React, { useState, useEffect } from 'react';
import { ChevronLeft, Smartphone, Check, Loader2, RefreshCw, Watch, Activity } from 'lucide-react';
import { storageService } from '../../services/storageService';

const DeviceCard = ({ id, name, icon, isConnected, onToggle, isSyncing }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isConnected ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-400'}`}>
          {icon}
        </div>
        <div>
          <div className="font-bold text-gray-800 text-sm">{name}</div>
          <div className="text-xs text-gray-400">
            {isConnected ? '已连接，自动同步中' : '点击连接以同步数据'}
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => onToggle(id)}
        disabled={isSyncing}
        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
          isConnected 
            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' 
            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-200'
        }`}
      >
        {isSyncing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isConnected ? (
          '断开'
        ) : (
          '连接'
        )}
      </button>
    </div>
  );
};

const DeviceConnect = ({ onBack }) => {
  const [devices, setDevices] = useState({});
  const [syncingId, setSyncingId] = useState(null);

  useEffect(() => {
    const settings = storageService.getSettings();
    setDevices(settings.devices || {});
  }, []);

  const handleToggle = async (id) => {
    if (devices[id]) {
      // Disconnect
      const newDevices = { ...devices, [id]: false };
      setDevices(newDevices);
      const currentSettings = storageService.getSettings();
      storageService.saveSettings({ ...currentSettings, devices: newDevices });
    } else {
      // Connect (Simulate Auth)
      setSyncingId(id);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newDevices = { ...devices, [id]: true };
      setDevices(newDevices);
      setSyncingId(null);
      
      const currentSettings = storageService.getSettings();
      storageService.saveSettings({ ...currentSettings, devices: newDevices });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10 flex items-center gap-2">
        <button onClick={onBack} className="p-1 -ml-1 text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h3 className="font-bold text-lg text-gray-900">设备与数据源</h3>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto pb-20">
        
        {/* Intro */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="text-blue-800 font-bold text-sm mb-1">为什么要连接设备？</h4>
            <p className="text-blue-600 text-xs leading-relaxed">
                连接智能设备（手环、手表、体脂称）后，合拍 AI 将自动获取您的运动、睡眠和身体数据，为您提供更精准的健康建议。
            </p>
        </div>

        {/* Platform List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">健康平台</h4>
          <DeviceCard 
            id="apple" 
            name="Apple 健康 (HealthKit)" 
            icon={<Activity className="w-5 h-5" />} 
            isConnected={devices.apple} 
            onToggle={handleToggle}
            isSyncing={syncingId === 'apple'}
          />
          <DeviceCard 
            id="huawei" 
            name="华为运动健康" 
            icon={<Smartphone className="w-5 h-5" />} 
            isConnected={devices.huawei} 
            onToggle={handleToggle}
            isSyncing={syncingId === 'huawei'}
          />
        </div>

        {/* Device List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">智能设备</h4>
          <DeviceCard 
            id="xiaomi" 
            name="小米手环 / 手表" 
            icon={<Watch className="w-5 h-5" />} 
            isConnected={devices.xiaomi} 
            onToggle={handleToggle}
            isSyncing={syncingId === 'xiaomi'}
          />
          <DeviceCard 
            id="garmin" 
            name="Garmin 佳明" 
            icon={<Watch className="w-5 h-5" />} 
            isConnected={devices.garmin} 
            onToggle={handleToggle}
            isSyncing={syncingId === 'garmin'}
          />
          <DeviceCard 
            id="oppo" 
            name="OPPO Watch" 
            icon={<Watch className="w-5 h-5" />} 
            isConnected={devices.oppo} 
            onToggle={handleToggle}
            isSyncing={syncingId === 'oppo'}
          />
        </div>

        {/* Manual Sync Button */}
        <div className="pt-4 flex justify-center">
            <button className="flex items-center gap-2 text-xs text-gray-400 hover:text-emerald-600 transition-colors">
                <RefreshCw className="w-3 h-3" />
                <span>手动同步所有数据</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceConnect;