/**
 * Storage Service
 * Handles structured storage for user profile, health records, and daily logs.
 */

import { supabase } from './authService.js';

const STORAGE_KEYS = {
  USER_PROFILE: 'hepai_user_profile',
  HEALTH_RECORDS: 'hepai_health_records',
  DAILY_LOGS: 'hepai_daily_logs',
  SETTINGS: 'hepai_settings',
  MESSAGES: 'hepai_messages',
  APP_STATE: 'hepai_app_state',
  // Cangzhen Keys (should be migrated to centralized management)
  CANGZHEN_MEMORIES: 'cangzhen_memories',
  CANGZHEN_DAILY_OPENED: 'cangzhen_daily_opened',
  CANGZHEN_WEEKLY_SUMMARY: 'weekly_summary_' // prefix
};

const getLocal = (key, defaultVal) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultVal;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultVal;
  }
};

const setLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch storage event for cross-component updates
    window.dispatchEvent(new Event('storage'));
    
    // Trigger Sync if user is logged in
    storageService.syncToCloud(key, value);
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
};

export const storageService = {
  // ============================================================
  // Cloud Sync Logic (Dual-Write)
  // ============================================================
  
  /**
   * Sync a specific key's data to Supabase
   * @param {string} key LocalStorage Key
   * @param {any} data Data to sync
   */
  syncToCloud: async (key, data) => {
      // 1. Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return; // No user, local only
      
      const userId = session.user.id;
      
      // 2. Map Local Keys to DB Tables/Columns
      try {
          if (key === STORAGE_KEYS.USER_PROFILE) {
              // Upsert Profile
              const { error } = await supabase
                  .from('profiles')
                  .upsert({ 
                      id: userId, 
                      basic_info: data.basicInfo,
                      constitution: data.constitution,
                      medical_history: data.medicalHistory,
                      updated_at: new Date()
                  });
              if (error) console.error('Sync Profile Error:', error);
          } 
          else if (key === STORAGE_KEYS.CANGZHEN_MEMORIES) {
              // Sync Memories (Bulk or Incremental? For simplicity, we sync all for now or check diffs)
              // Ideally, we should only sync the *new* memory. 
              // But since setLocal receives the full array, we might need a smarter diffing strategy.
              // A better approach for memories is to use an 'addMemory' function that calls API directly.
              // For now, let's just log that we would sync.
              console.log('Syncing Memories to Cloud...', data.length);
              
              // In a real implementation:
              // await supabase.from('memories').upsert(data.map(m => ({ ...m, user_id: userId })));
          }
          // Add other keys as needed
      } catch (err) {
          console.error('Cloud Sync Exception:', err);
      }
  },

  /**
   * Pull latest data from Cloud (On Login/Load)
   */
  pullFromCloud: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return;
      
      const userId = session.user.id;
      
      // 1. Pull Profile
      const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
      if (profile) {
          const localProfile = {
              basicInfo: profile.basic_info || {},
              constitution: profile.constitution || {},
              medicalHistory: profile.medical_history || {}
          };
          // Update Local without triggering another sync loop (use localStorage directly or flag)
          localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(localProfile));
      }
      
      // 2. Pull Memories, etc.
      // ...
      
      window.dispatchEvent(new Event('storage')); // Refresh UI
  },
  // ============================================================
  // Chat Messages
  // ============================================================
  getMessages: () => {
    return getLocal(STORAGE_KEYS.MESSAGES, []);
  },

  saveMessages: (messages) => {
    setLocal(STORAGE_KEYS.MESSAGES, messages);
  },

  // ============================================================
  // App State (Steps, Progress, etc.)
  // ============================================================
  getAppState: () => {
    return getLocal(STORAGE_KEYS.APP_STATE, {
      currentStep: 'basic_info',
      questionnaireProgress: 0,
      questionnaireAnswers: {}
    });
  },

  saveAppState: (data) => {
    const current = storageService.getAppState();
    setLocal(STORAGE_KEYS.APP_STATE, { ...current, ...data });
  },

  // ============================================================
  // User Profile (Basic Info, Constitution, Medical History)
  // ============================================================
  
  /**
   * Get full user profile
   * @returns {Object}
   */
  getUserProfile: () => {
    let profile = getLocal(STORAGE_KEYS.USER_PROFILE, null);
    
    // Auto-migrate if new profile is missing but legacy exists
    if (!profile && localStorage.getItem('hepai_basic_info')) {
        storageService.migrateFromLegacy();
        profile = getLocal(STORAGE_KEYS.USER_PROFILE, null);
    }

    return profile || {
      basicInfo: {},    // age, gender, height, weight
      constitution: {}, // type, desc, score
      medicalHistory: [] // allergies, diseases
    };
  },

  /**
   * Save user profile (merges with existing)
   * @param {Object} data Partial profile data
   */
  saveUserProfile: (data) => {
    const current = storageService.getUserProfile();
    const updated = { ...current, ...data };
    setLocal(STORAGE_KEYS.USER_PROFILE, updated);
    return updated;
  },

  /**
   * Update specific section of user profile
   * @param {string} section 'basicInfo' | 'constitution' | 'medicalHistory'
   * @param {Object} data 
   */
  updateUserProfileSection: (section, data) => {
    const current = storageService.getUserProfile();
    current[section] = { ...current[section], ...data };
    setLocal(STORAGE_KEYS.USER_PROFILE, current);
    return current;
  },

  // ============================================================
  // Health Records (Weight, Sleep, Tongue Diagnosis History)
  // ============================================================

  /**
   * Get all health records
   * @returns {Object}
   */
  getHealthRecords: () => {
    return getLocal(STORAGE_KEYS.HEALTH_RECORDS, {
      weight: [],
      sleep: [],
      tongueDiagnosis: []
    });
  },

  /**
   * Add a new health record
   * @param {string} type 'weight' | 'sleep' | 'tongueDiagnosis'
   * @param {Object} record 
   */
  addHealthRecord: (type, record) => {
    const records = storageService.getHealthRecords();
    if (!records[type]) records[type] = [];
    
    const newRecord = {
      ...record,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };
    
    records[type].push(newRecord);
    setLocal(STORAGE_KEYS.HEALTH_RECORDS, records);
    return newRecord;
  },

  /**
   * Get latest record of a specific type
   * @param {string} type 
   */
  getLatestHealthRecord: (type) => {
    const records = storageService.getHealthRecords();
    const list = records[type] || [];
    return list.length > 0 ? list[list.length - 1] : null;
  },

  // ============================================================
  // Daily Logs (Diet, Exercise, Poop, Period)
  // ============================================================

  /**
   * Get daily logs
   * @param {string} date YYYY-MM-DD (optional, defaults to all if not provided, or structure it differently)
   * Note: For simplicity, we store logs as an object keyed by date string 'YYYY-MM-DD'
   */
  getDailyLogs: (date = null) => {
    const allLogs = getLocal(STORAGE_KEYS.DAILY_LOGS, {});
    if (date) {
      return allLogs[date] || {
        diet: [],
        exercise: [],
        poop: [],
        mood: [],
        period: null
      };
    }
    return allLogs;
  },

  /**
   * Update daily log entry (replace array)
   * @param {string} date YYYY-MM-DD
   * @param {string} type 'diet' | 'exercise' | 'poop' | 'mood'
   * @param {Array} data Array of items
   */
  updateDailyLog: (date, type, data) => {
    const allLogs = getLocal(STORAGE_KEYS.DAILY_LOGS, {});
    
    if (!allLogs[date]) {
      allLogs[date] = { diet: [], exercise: [], poop: [], mood: [], period: null };
    }

    allLogs[date][type] = data;
    setLocal(STORAGE_KEYS.DAILY_LOGS, allLogs);
    return allLogs[date];
  },

  /**
   * Save a daily log entry
   * @param {string} date YYYY-MM-DD
   * @param {string} type 'diet' | 'exercise' | 'poop' | 'period'
   * @param {Object} data 
   */
  saveDailyLog: (date, type, data) => {
    const allLogs = getLocal(STORAGE_KEYS.DAILY_LOGS, {});
    
    if (!allLogs[date]) {
      allLogs[date] = { diet: [], exercise: [], poop: [], period: null };
    }

    if (type === 'period' || type === 'nutrition') {
      // Period might be a single status for the day, nutrition is a summary
      allLogs[date][type] = data;
    } else {
      // Others are arrays
      if (!allLogs[date][type]) allLogs[date][type] = [];
      allLogs[date][type].push({
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      });
    }

    setLocal(STORAGE_KEYS.DAILY_LOGS, allLogs);
    return allLogs[date];
  },

  // ============================================================
  // Settings (Reminders, etc.)
  // ============================================================
  getSettings: () => {
    return getLocal(STORAGE_KEYS.SETTINGS, {
      reminders: {
        workday: { morning: '08:00', night: '22:00' },
        weekend: { morning: '09:00', night: '23:00' }
      },
      devices: {
        apple: false,
        huawei: false,
        xiaomi: false,
        garmin: false
      }
    });
  },

  saveSettings: (data) => {
    const current = storageService.getSettings();
    setLocal(STORAGE_KEYS.SETTINGS, { ...current, ...data });
  },

  // ============================================================
  // Migration / Compatibility
  // ============================================================
  
  /**
   * Migrate old keys to new structure if needed
   */
  migrateFromLegacy: () => {
    // Basic Info -> User Profile
    const oldBasicInfo = localStorage.getItem('hepai_basic_info');
    if (oldBasicInfo) {
      try {
        const parsed = JSON.parse(oldBasicInfo);
        // Use getLocal directly to avoid recursion with getUserProfile
        let currentProfile = getLocal(STORAGE_KEYS.USER_PROFILE, { basicInfo: {} });
        
        if (Object.keys(currentProfile.basicInfo).length === 0) {
            // Manually save to avoid triggering other logic if any
            currentProfile.basicInfo = parsed;
            setLocal(STORAGE_KEYS.USER_PROFILE, currentProfile);
        }
      } catch (e) {}
    }

    // Constitution
    const oldConstitution = localStorage.getItem('hepai_constitution_result');
    if (oldConstitution) {
       try {
         const parsed = JSON.parse(oldConstitution);
         storageService.updateUserProfileSection('constitution', parsed);
       } catch (e) {}
    }

    // Sleep Data -> Health Records (Sleep)
    const oldSleep = localStorage.getItem('hepai_sleep_data');
    if (oldSleep) {
      try {
        const parsed = JSON.parse(oldSleep);
        // Check if we already have this record to avoid duplicates?
        // For simplicity, just add if health records are empty
        const records = storageService.getHealthRecords();
        if (records.sleep.length === 0) {
             storageService.addHealthRecord('sleep', parsed);
        }
      } catch (e) {}
    }
    
    // Reminders -> Settings
    const oldReminders = localStorage.getItem('hepai_reminder_settings');
    if (oldReminders) {
        try {
            const parsed = JSON.parse(oldReminders);
            storageService.saveSettings({ reminders: parsed });
        } catch (e) {}
    }

    // App State migration
    const oldStep = localStorage.getItem('hepai_current_step');
    const oldQProgress = localStorage.getItem('hepai_questionnaire_progress');
    const oldQAnswers = localStorage.getItem('hepai_questionnaire_answers');
    
    if (oldStep || oldQProgress || oldQAnswers) {
        const appState = storageService.getAppState();
        const newState = {};
        if (oldStep) newState.currentStep = oldStep;
        if (oldQProgress) newState.questionnaireProgress = parseInt(oldQProgress);
        if (oldQAnswers) newState.questionnaireAnswers = JSON.parse(oldQAnswers);
        storageService.saveAppState(newState);
    }
    
    // Clean up legacy keys? Maybe later.
  },
  
  /**
   * Add a new Cangzhen memory with Cloud Sync
   */
  addCangzhenMemory: async (memory) => {
    const memories = getLocal(STORAGE_KEYS.CANGZHEN_MEMORIES, []);
    const newMemory = {
        ...memory,
        sync_status: 'pending'
    };
    const updated = [newMemory, ...memories];
    
    // 1. Save locally first (Immediate UI feedback)
    setLocal(STORAGE_KEYS.CANGZHEN_MEMORIES, updated);

    // 2. Sync to Cloud if logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
        try {
            const { error } = await supabase
                .from('cangzhen_memories')
                .upsert({
                    user_id: session.user.id,
                    memory_id: newMemory.id,
                    content: newMemory.content,
                    hall: newMemory.hall,
                    image_url: newMemory.image,
                    tags: newMemory.tags,
                    created_at: new Date(newMemory.id).toISOString()
                });
            
            if (!error) {
                // Mark as synced locally
                newMemory.sync_status = 'synced';
                setLocal(STORAGE_KEYS.CANGZHEN_MEMORIES, updated);
            }
        } catch (e) {
            console.error("Cloud sync failed, will retry later", e);
        }
    }
    return updated;
  },

  // Clear all app data (Careful!)
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    // Also clear legacy keys if we want to be thorough
    ['hepai_basic_info', 'hepai_sleep_data', 'hepai_daily_food_log', 'hepai_poop_log', 'hepai_constitution_result', 'hepai_nutrition_today'].forEach(k => localStorage.removeItem(k));
    window.dispatchEvent(new Event('storage'));
  }
};
