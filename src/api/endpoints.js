// =============================================================================
// API ENDPOINTS CONFIGURATION
// Wedding & Event Management Web Application
// =============================================================================

const POST = {
  // =============================================================================
  // AUTHENTICATION & USER MANAGEMENT
  // =============================================================================
  LOGIN: "web_app/login",
  FORGOT_PASSWORD: "web_app/forgot_password",
  RESET_PASSWORD: "web_app/reset_password",
  ADD_USER: "registeration/user",
  UPDATE_USER: "contact",
  UPDATE_PROFILE: "contact",
  ADD_USER_TYPE: "role",
  UPDATE_USER_TYPE: "role",

  // =============================================================================
  // EVENT MANAGEMENT
  // =============================================================================
  ADD_EVENT: "event",
  UPDATE_EVENT: "event",
  CREATE_LIVE_EVENT: "live_event",

  // =============================================================================
  // CEREMONY MANAGEMENT
  // =============================================================================
  ADD_CEREMONY: "ceremony",
  UPDATE_CEREMONY: "ceremony",

  // =============================================================================
  // VENUE MANAGEMENT
  // =============================================================================
  ADD_VENUE: "venue",
  UPDATE_VENUE: "venue",
  ADD_NEARBY_ATTRACTIONS: "nearby_attraction",

  // =============================================================================
  // VENDOR MANAGEMENT
  // =============================================================================
  ADD_VENDOR: "vendor",
  UPDATE_VENDOR: "vendor",
  ADD_RECOMMANDED_VENDOR: "recommend_vendor",
  UPDATE_VENDOR_TAGS: "tag",

  // =============================================================================
  // CATEGORY & CLASSIFICATION MANAGEMENT
  // =============================================================================
  POST_CATEGORY: "category",
  POST_SUB_CATEGORY: "sub_category",
  POST_FURTHER_CLASSIFICATION: "sub_category_classification",

  // =============================================================================
  // CONTACT & GUEST MANAGEMENT
  // =============================================================================
  ADD_CONTACT: "contact",
  UPDATE_CONTACT: "contact",
  IMPORT_EXCEL: "contact/import_file",
  ADD_GROUP: "group",
  ADD_FAMILY: "family",
  ADD_INVITEE: "invitee",
  MARK_RSVP: "mark_RSVP",
  ADD_QUICK_CONTACT: "quick_mark/contact",
  DELETE_QUICK_CONTACT: "quick_mark/contact",
  BULK_INSERT: "contact/bulkInsert",

  SEND_OTP: "/mobile/send_otp",
  VERIFY_OTP_LOGIN: "/mobile/login",
  // =============================================================================
  // GIFT MANAGEMENT
  // =============================================================================
  ADD_GIFT: "gift",
  UPDATE_GIFT: "gift",
  GIFT_ALLOCATE: "gift_allocate",
  ADD_RECEIVED_GIFT: "gift_received",
  UPDATE_RECEIVED_GIFT: "gift_received",

  // =============================================================================
  // INVITATION & COMMUNICATION SYSTEM
  // =============================================================================
  ADD_INVITATION_CARD: "invitation_card",
  CARD_ALLOCATE: "card_allocation",
  SEND_GREETINGS: "send_email/seelcted_contact",
  SEND_EMAIL: "send_email",
  SEND_SMS: "send_sms",
  SEND_SCHEDULE_SMS: "send_sms/seelcted_contact",
  SEND_SCHEDULE_INVITATION: "card_allocation/schedule",
  UPDATE_SEND_SCHEDULE_INVITATION: "card_allocation/update_schedule",
  UPDATE_SCHEDULE: "send_sms/schedule_update",

  // =============================================================================
  // DOUBLE TICK MESSAGING SYSTEM
  // =============================================================================
  SEND_TEMPLATES: "/double_tick/send_template",
  INVITATION_CARD_USER: "/public/check-invitation",

  // =============================================================================
  // ACCOMMODATION & TRAVEL MANAGEMENT
  // =============================================================================
  HOTEL: "hotel",
  HOTEL_ROOM: "allocated_rooms",
  HOTEL_ROOM_BULK: "allocated_rooms/bulk-allocate",
  SETUP_ROOM: "hotel_room",
  ARRIVAL_DEPARTURE: "arrival_departure",
  ADD_CAR: "car",
  UPDATE_CAR: "car",
  ADD_ALLOCATE_CAR: "car_allocation",
  UPDATE_ALLOCATE_CAR: "car_allocation",

  // =============================================================================
  // GUEST TRAVEL MANAGEMENT
  // =============================================================================
  GUEST_FLIGHT: "guest-flight-train",
  GUEST_TRAIN: "guest-flight-train",

  // =============================================================================
  // MENU & CATERING MANAGEMENT
  // =============================================================================
  MENU: "menu",

  // =============================================================================
  // CEREMONY SUPPLIES & SAMAGRI
  // =============================================================================
  ADD_SAMAGRI: "samagri",

  // =============================================================================
  // TASK & CHECKLIST MANAGEMENT
  // =============================================================================
  ADD_CHECKLIST: "check_list",
  UPDATE_CHECKLIST: "check_list",
  CHECKLIST_STATUS: "check_list/update_status",
  TASK: "task",
  UPDATE_TASK_STATUS: "task_update_status",

  // =============================================================================
  // BUDGET MANAGEMENT
  // =============================================================================
  ADD_BUDGET: "budget",

  // =============================================================================
  // CUSTOM FIELDS & CONFIGURATIONS
  // =============================================================================
  CUSTOM_FIELD_TYPE: "custom_field_type",
  CUSTOM_FIELD_LIBRARY: "custom_field_library",

  // =============================================================================
  // RECOMMENDATION & TRENDING SYSTEM
  // =============================================================================
  ADD_ACTIONS: "recommended_or_trending_ids",

  // =============================================================================
  // VISUAL & UI MANAGEMENT
  // =============================================================================
  ADD_COLOR_CODE: "color_code",

  // =============================================================================
  // BULK IMPORT OPERATIONS
  // =============================================================================
  IMPORT_HOTEL_ROOM_EXCEL: "hotel_room/import",
  IMPORT_GUEST_FLIGHT_EXCEL: "guest-flight-train/import",
  IMPORT_GUEST_TRAIN_EXCEL: "guest-flight-train/import",
  IMPORT_ARRIVAL_DEPARTURE_EXCEL: "arrival_departure/import",
  SEND_ARRIVAL_DEPARTURE_MESSAGE: "arrival_departure/send-arrival-message",

  // =============================================================================
  // REPORTS & ANALYTICS
  // =============================================================================
  INVITATION_CARD_REPORT_USER: "report/card_allocation",
  UPDATE_SERVICE_REQUEST: "service_request",

  // =============================================================================
  // FILE MANAGEMENT
  // =============================================================================
  PROFILE_UPLOAD: "file_upload",

  // =============================================================================
  // QR CODE MANAGEMENT
  // =============================================================================
  BULK_QR_CODES_ASSIGN: "/PfQrCodesController/bulkAssignQrCodes",
  USER_COUNTS: "/PfQrCodesController/getUserQrCodeCounts",
  USER_ASSIGN_QR_CODE: "/PfQrCodesController/getQrCodeList",
  REGISTER_SUBSCRIBER: "/PfRegisterController/register",


  REGISTER_QR_SUBSCRIBER:"/contact/register-qr",


  BULK_USER_IMPORT: "bulk_user_import"
};

const GET = {
  // =============================================================================
  // DASHBOARD & STATISTICS
  // =============================================================================
  GET_STATS: "dashboard/general_master_stats",
  GET_TASK_STATUS: "dashboard/task_status_count",
  GET_PENDING_TASK: "dashboard/pending_tasks_list",

  // =============================================================================
  // EVENT MANAGEMENT
  // =============================================================================
  GET_EVENTS: "event",
  GET_EVENT_STATS: "event/stats",

  // =============================================================================
  // CEREMONY MANAGEMENT
  // =============================================================================
  GET_CEREMONY: "ceremony",

  // =============================================================================
  // VENUE MANAGEMENT
  // =============================================================================
  GET_VENUE: "venue",
  GET_VENUE_BY_ID: "venue",
  HELD_AT: "venue",
  GET_RECOMMANDED_VENUE: "venue/recommended",
  GET_NEARBY_ATTRACTIONS: "nearby_attraction",

  // =============================================================================
  // VENDOR MANAGEMENT
  // =============================================================================
  GET_VENDOR: "vendor",
  GET_RECOMMANDED_VENDOR: "recommend_vendor",
  GET_VENDOR_TAGS: "tag",

  // =============================================================================
  // CATEGORY & CLASSIFICATION MANAGEMENT
  // =============================================================================
  GET_CATEGORY: "category",
  GET_SUB_CATEGORY: "sub_category",
  GET_BY_CATEGORY: "sub_category/by_category",
  GET_FURTHER_CLASSIFICATION: "sub_category_classification",
  POST_FURTHER_CLASSIFICATION_BY_IDS: "sub_category_classification/classification/by_sub_category_id",

  // =============================================================================
  // CONTACT & GUEST MANAGEMENT
  // =============================================================================
  GET_CONTACT: "contact",
  GET_ALL_CONTACT_BY_GROUP: "contact_user/group_by",
  GET_CONTACT_BY_GROUP: "contact_user/group_by",
  GET_CONTACT_GROUP: "group",
  GET_GROUP: "group",
  GET_FAMILY: "family",
  GET_GROUP_CONTACT: "contact_user/get_by_group",
  GET_GROUP_CONTACT_ARRIVAL: "contact_user/get_by_group_arrival",
  INVITE_CONTACT_LIST_BY_ID: "invitee/contact_list",
  GET_PREFERENCE_COUNT: "contact_user/preferences/count",

  // =============================================================================
  // GIFT MANAGEMENT
  // =============================================================================
  GET_GIFTS: "gift",
  GET_RECEIVED_GIFT: "gift_received",

  // =============================================================================
  // INVITATION & COMMUNICATION SYSTEM
  // =============================================================================
  INVITATION_CARDS: "invitation_card",
  SEND_SCHEDULE_INVITATION_LIST: "card_allocation/schedule",
  GET_SCHEDULE_LIST: "send_sms/schedule_list",

  // =============================================================================
  // DOUBLE TICK MESSAGING SYSTEM
  // =============================================================================
  GET_DOUBLE_TICK_LIST: "/double_tick/message_history",
  GET_TEMPLATE_LISTS: "/double_tick/templates",

  // =============================================================================
  // ACCOMMODATION & TRAVEL MANAGEMENT
  // =============================================================================
  GET_HOTEL: "hotel",
  GET_HOTEL_ROOM: "allocated_rooms",
  GET_SETUP_ROOM: "hotel_room",
  ROOM_TYPE_BY_HOTEL: "hotel_room",
  GET_ROOM_BY_HOTEL_AND_ROOM_TYPE: "hotel_room/by-type-and-hotel",
  GET_ARRIVAL_DEPARTURE: "arrival_departure",
  UPDATE_SEND_SCHEDULE_INVITATION: "card_allocation/update_schedule",
  GET_CAR: "car",
  GET_AVAILABLE_CAR: "car/available",
  GET_ALLOCATE_CAR: "car_allocation",

  // =============================================================================
  // GUEST TRAVEL MANAGEMENT
  // =============================================================================
  GET_GUEST_FLIGHTS: "guest-flight-train",
  GET_GUEST_FLIGHT_REPORT: "guest-flight-train",
  GET_GUEST_TRAINS: "guest-flight-train",
  GET_GUEST_TRAIN_REPORT: "guest-flight-train",

  // =============================================================================
  // MENU & CATERING MANAGEMENT
  // =============================================================================
  RECOMMENDED_MENU_ID: "trending_menu",
  GET_MENU: "menu",
  GET_TRENDING_MENU: "trending_menu",
  GET_CEREMONY_MENU_ITEM: "recommended_menu",
  GET_CEREMONY_TRENDING_MENU_ITEM: "trending_menu",
  GET_TASTE_PROFILE: "taste_profile",
  GET_MENU_TYPE: "menu_type",
  GET_CUISINE: "cuisine",

  // =============================================================================
  // CEREMONY SUPPLIES & SAMAGRI
  // =============================================================================
  GET_SAMAGRI: "samagri",
  GET_RECOMMANDED_SAMAGRI: "samagri",
  GET_PANCHANG: "panchang",

  // =============================================================================
  // TASK & CHECKLIST MANAGEMENT
  // =============================================================================
  GET_TASK: "task",
  GET_CHECKLIST: "check_list",

  // =============================================================================
  // BUDGET MANAGEMENT
  // =============================================================================
  GET_BUDGET_BY_ID: "budget",

  // =============================================================================
  // USER MANAGEMENT
  // =============================================================================
  GET_USERS: "user/list",
  GET_USER_BY_ID: "contact",
  GET_USER_TYPE: "role",
  GET_EVENTS_BY_NUMBER: "/mobile/event",

  // =============================================================================
  // CUSTOM FIELDS & CONFIGURATIONS
  // =============================================================================
  GET_CUSTOM_FIELD_TYPE: "custom_field_type",
  GET_CUSTOM_FIELD_LIBRARY: "custom_field_library",

  // =============================================================================
  // RECOMMENDATION & TRENDING SYSTEM
  // =============================================================================
  GET_ACTIONS: "recommended_or_trending_ids",

  // =============================================================================
  // VISUAL & UI MANAGEMENT
  // =============================================================================
  GET_COLOR_CODES: "color_code",

  // =============================================================================
  // SYSTEM PREFERENCES & SETTINGS
  // =============================================================================
  PREFERENCE: "preference",

  // =============================================================================
  // REPORTS & ANALYTICS
  // =============================================================================
  GET_CEREMONY_REPORT: "report/ceremony",
  GET_ARRIVAL_DEPARTURE_REPORT: "report/arrival_departure",
  GET_MENU_REPORT: "report/menu",
  GET_TASKS_REPORT: "report/tasks",
  GET_CAR_REPORT: "report/car",
  GET_CAR_ALLOCATE_REPORT: "report/car_allocation",
  GET_HOTEL_REPORT: "report/hotel",
  GET_VENDOR_REPORT: "report/vendor",
  GET_SAMAGRI_REPORT: "report/samagri",
  GET_GIFT_REPORT: "report/gift",
  GET_CONTACT_REPORT: "report/contact",
  GET_INVITATION_CARD_REPORT: "contact/card-allocations",
  GET_EVENT_REPORT: "report/event",
  GET_VENUE_REPORT: "report/venue",
  GET_RSVP_REPORT: "report/invitees",
  GET_RECEIVED_GIFT_REPORT: "report/gift_received",
  GET_HOTEL_ROOMS_REPORT: "report/room_allocation",
  GET_CITY: "report/cities_list",

  // =============================================================================
  // DATA EXPORT & IMPORT
  // =============================================================================
  EXPORT_DATA_LIST: "model_list",
  DATA_FOR_EXPORTS: "model_list",

  // =============================================================================
  // CALENDAR & SCHEDULING
  // =============================================================================
  GET_CALENDAR: "calender",

  // =============================================================================
  // SERVICE REQUESTS
  // =============================================================================
  GET_SERVICE_REQUEST: "service_request",

  // =============================================================================
  // STATUS UPDATES & MAINTENANCE
  // =============================================================================
  UPDATE_SAMAGRI_LIST: "samagri/status",
  UPDATE_HOTEL_ROOM: "allocated_rooms/update_status",
  UPDATE_ARRIVAL_DEPARTURE_STATUS: "arrival_departure/update_status",
};

const PUT = {
  // =============================================================================
  // GUEST TRAVEL MANAGEMENT UPDATES
  // =============================================================================
  GUEST_FLIGHT: "guest-flight-train",
  GUEST_TRAIN: "guest-flight-train",
};

const DELETE = {
  // =============================================================================
  // EVENT MANAGEMENT
  // =============================================================================
  DELETE_EVENT: "event",

  // =============================================================================
  // CEREMONY MANAGEMENT
  // =============================================================================
  DELETE_CEREMONY: "ceremony",

  // =============================================================================
  // VENUE MANAGEMENT
  // =============================================================================
  DELETE_VENUE: "venue",
  DELETE_NEARBY_ATTRACTIONS: "nearby_attraction",

  // =============================================================================
  // VENDOR MANAGEMENT
  // =============================================================================
  DELETE_VENDOR: "vendor",
  DELETE_RECOMMANDED_VENDOR: "recommend_vendor",
  DELETE_VENDOR_TAG: "tag",

  // =============================================================================
  // CATEGORY & CLASSIFICATION MANAGEMENT
  // =============================================================================
  DELETE_CATEGORY: "category",
  DELETE_SUB_CATEGORY: "sub_category",
  DELETE_FURTHER_CLASSIFICATION: "sub_category_classification",

  // =============================================================================
  // CONTACT & GUEST MANAGEMENT
  // =============================================================================
  DELETE_CONTACT: "contact",
  DELETE_GROUP: "group",
  DELETE_FAMILY: "family",

  // =============================================================================
  // GIFT MANAGEMENT
  // =============================================================================
  DELETE_GIFT: "gift",
  DELETE_RECEIVED_GIFT: "gift_received",

  // =============================================================================
  // INVITATION & COMMUNICATION SYSTEM
  // =============================================================================
  DELETE_SCHEDULE_SMS: "send_sms/schedule_delete",
  DELETE_CARD_INVITATION: "card_allocation/delete_schedule",

  // =============================================================================
  // ACCOMMODATION & TRAVEL MANAGEMENT
  // =============================================================================
  DELETE_HOTEL: "hotel",
  DELETE_HOTEL_ROOM: "allocated_rooms",
  DELETE_SETUP_ROOM: "hotel_room",
  DELETE_ARRIVAL_DEPARTURE: "arrival_departure",
  DELETE_CAR: "car",
  DELETE_ALLOCATE_CAR: "car_allocation",

  // =============================================================================
  // GUEST TRAVEL MANAGEMENT
  // =============================================================================
  DELETE_GUEST_FLIGHT: "guest-flight-train",
  DELETE_GUEST_TRAIN: "guest-flight-train",

  // =============================================================================
  // MENU & CATERING MANAGEMENT
  // =============================================================================
  DELETE_MENU: "menu",

  // =============================================================================
  // TASK & CHECKLIST MANAGEMENT
  // =============================================================================
  DELETE_TASK: "task",
  DELETE_CHECKLIST: "check_list",

  // =============================================================================
  // USER MANAGEMENT
  // =============================================================================
  DELETE_USER: "contact",
  DELETE_USER_TYPE: "role",

  // =============================================================================
  // CUSTOM FIELDS & CONFIGURATIONS
  // =============================================================================
  DELETE_CUSTOM_FIELD_TYPE: "custom_field_type",
  DELETE_CUSTOM_FIELD_LIBRARY: "custom_field_library",

  // =============================================================================
  // VISUAL & UI MANAGEMENT
  // =============================================================================
  DELETE_COLOR_CODE: "color_code",
};

export { DELETE, GET, POST, PUT };
