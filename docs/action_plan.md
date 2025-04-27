Action Plan

1. ✅ Fix API method discrepancies:
   Replaced all postMcp/getMcp calls with mcpRequest by implementing the missing methods in ApiService

2. ✅ Standardize API domains:
   Updated API domains to consistently use .uk instead of .co.uk

3. ✅ Implement reportMcpError:
   Added missing method to errorMonitoringService

4. ✅ Consolidate Sentry initialization:
   Merged duplicate initialization functions
   Preserved PII scrubbing functionality

5. ✅ Remove legacy WhatsApp code:
   Deleted WhatsApp-specific methods from mcpService

6. Update pricing references:
   Global search and replace outdated pricing (No instances of £7.99 found in codebase)

7. Scaffold OpenAI integration:
   Create basic structure following review's specification

8. Fix extraction logic:
   Enhance extractLeaseholdYears and extractTenure to improve accuracy
