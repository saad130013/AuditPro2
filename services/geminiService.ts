
// This service is now placeholder as we use static text for all reports
export const generateExecutiveSummary = async (dataSummary: string): Promise<string> => {
  return "The information presented herein is based on data provided by Safari Company. The data has not been audited or approved by the Environmental Services Department and is provided for guidance purposes only and remains subject to review, amendment, and change.";
};

export const generateComparativeSummary = async (comparisonData: string): Promise<string> => {
  return "Comparative analysis remains subject to internal review and final audit procedures.";
};
