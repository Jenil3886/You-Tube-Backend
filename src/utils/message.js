export const ERROR_MSG = {
  // General
  INTERNAL_SERVER_ERROR: "Internal server error",
  INVALID_USER_AGENT: "Invalid User Agent",

  // Auth
  UNAUTHORIZED: "Unauthorized!",
  GENERATE_TOKEN_ERROR: "Failed to generate tokens",
  TOKEN_EXPIRED_ERROR: "TokenExpiredError",
  TOKEN_EXPIRED: "Token has expired!",
  INVALID_TOKEN: "Invalid refresh token",
  INVALID_USER: "Invalid user credentials",
  ALL_FIELDS_ARE_REQUIRED: "All fields are required",
  USER_ALREADY_EXISTS: "User with email or username already exists",
  AVATAR_FILE_IS_REQUIRED: "Avatar file is required",
  GENERATING_REFRESH_TOKEN_ERROR:
    "Something went wrong while generating refresh and access tokens",
  REGISTRRING_THE_USER_ERROR: "Something went wrong while registering the user",
  USER_NOT_FOUND: "User does not exist",
  AVATAR_NOT_FOUND: "Avatar file is missing",
  INVALID_OLD_PASSWORD: "Invalid old password",
  AVATAR_UPLODING_ERROR: "Error while uploading avatar",

  // Company
  COMPANY_NOT_FOUND: "Company not found",
  COMPANY_ALREADY_EXISTS: "Company already exists with this title",

  // Contact
  CONTACT_NOT_FOUND: "Contact not found",
  CONTACT_ALREADY_EXISTS: "Contact already exists with this email",
  ONE_OR_MORE_CONTACTS_NOT_FOUND: "One or more contacts not found",

  // Tag
  TAG_NOT_FOUND: "Tag not found",
  ONE_OR_MORE_TAGS_NOT_FOUND: "One or more tags not found",
  TAG_ALREADY_EXISTS: "Tag already exists with this title",

  // ESP
  ESP_NOT_FOUND: "ESP not found",
  ESP_ALREADY_EXISTS: "ESP already exists with this name",
  NOT_VALID_ESP: "Not a valid ESP",

  // Sender
  SENDER_NOT_FOUND: "Sender not found",
  SENDER_ALREADY_EXISTS: "Sender already exists with this email and Provider",

  // Encryption
  ENCRYPTION_FAILED: "Encryption failed",
  DECRYPTION_FAILED: "Decryption failed",

  // Draft
  DRAFT_NOT_FOUND: "Draft not found",

  // Email
  EMAIL_NOT_FOUND: "Email not found",
  EMAIL_CANNOT_MODIFY: "Email cannot be modified",

  // Email
  FOLLOW_UP_NOT_FOUND: "Follow Up not found",
  FOLLOW_UP_CANNOT_SENT: "Follow Up cannot be sent",
  FOLLOW_UP_CANNOT_MODIFY: "Follow Up cannot be modified",

  // Purpose
  PURPOSE_NOT_FOUND: "Purpose not found",
  PURPOSE_ALREADY_EXISTS: "Purpose already exists with this name",

  // Log
  LOG_NOT_FOUND: "Log not found",
};

export const VALIDATION_MSG = {
  // Contact
  PHONE: "Phone number must be 10 characters long",
};

export const SUCCESS_MSG = {
  // General
  OK: "OK!",

  // Auth
  USER_REGISTERED: "User registered successfully",
  LOGGED_IN: "User Logged in successfully",
  LOGGED_OUT: "User Logged out successfully",
  PASSWORD_UPDATED: "Password updated successfully",

  // User
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",
  USER_FETCHED: "Current user fetched successfully",

  // ACCOUNT
  ACCOUNT_UPDATED: "Account details updated successfully",
  AVATAR_UPDATED: "Avatar image updated successfully",

  // Company
  COMPANY_CREATED: "Company created successfully",
  COMPANY_UPDATED: "Company updated successfully",
  COMPANY_DELETED: "Company deleted successfully",
  COMPANY_WITH_CONTACTS_DELETED:
    "Company along with its contacts deleted successfully",
  COMPANIES_FETCHED: "Companies fetched successfully",
  COMPANY_FETCHED: "Company fetched successfully",

  // Company
  CONTACT_CREATED: "Contact created successfully",
  CONTACT_UPDATED: "Contact updated successfully",
  CONTACT_DELETED: "Contact deleted successfully",
  CONTACTS_FETCHED: "Contacts fetched successfully",
  CONTACT_FETCHED: "Contact fetched successfully",

  // Tag
  PURPOSE_CREATED: "Purpose created successfully",
  PURPOSE_UPDATED: "Purpose updated successfully",
  PURPOSE_DELETED: "Purpose deleted successfully",
  PURPOSES_FETCHED: "Purposes fetched successfully",
  PURPOSE_FETCHED: "Purpose fetched successfully",

  // Tag
  TAG_CREATED: "Tag created successfully",
  TAG_UPDATED: "Tag updated successfully",
  TAG_DELETED: "Tag deleted successfully",
  TAGS_FETCHED: "Tags fetched successfully",
  TAG_FETCHED: "Tag fetched successfully",

  // ESP
  ESP_CREATED: "ESP created successfully",
  ESP_UPDATED: "ESP updated successfully",
  ESP_DELETED: "ESP deleted successfully",
  ESPS_FETCHED: "ESPs fetched successfully",
  ESP_FETCHED: "ESP fetched successfully",

  // Sender
  SENDER_CREATED: "Sender created successfully",
  SENDER_UPDATED: "Sender updated successfully",
  SENDER_RESTORED: "Existing Sender restored successfully",
  SENDER_DELETED: "Sender deleted successfully",
  SENDERS_FETCHED: "Senders fetched successfully",
  SENDER_FETCHED: "Sender fetched successfully",

  // Draft
  DRAFT_CREATED: "Draft created successfully",
  DRAFT_UPDATED: "Draft updated successfully",
  DRAFT_DELETED: "Draft deleted successfully",
  DRAFTS_FETCHED: "Drafts fetched successfully",
  DRAFT_FETCHED: "Draft fetched successfully",

  // Email
  EMAIL_CREATED: "Email created successfully",
  EMAIL_UPDATED: "Email updated successfully",
  EMAIL_DELETED: "Email deleted successfully",
  EMAILS_FETCHED: "Emails fetched successfully",
  EMAIL_FETCHED: "Email fetched successfully",
  EMAIL_EVENT_HANDLED: "Email event handled successfully",

  // Follow Up
  FOLLOW_UP_CREATED: "Follow Up created successfully",
  FOLLOW_UP_UPDATED: "Follow Up updated successfully",
  FOLLOW_UP_DELETED: "Follow Up deleted successfully",
  FOLLOW_UPS_FETCHED: "Follow Ups fetched successfully",
  FOLLOW_UP_FETCHED: "Follow Up fetched successfully",

  // Log
  LOG_DELETED: "Log deleted successfully",
  LOGS_DELETED: "Logs deleted successfully",
  LOGS_FETCHED: "Logs fetched successfully",
  LOG_FETCHED: "Log fetched successfully",
};
