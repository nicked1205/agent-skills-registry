namespace server.services;

public static class DiffCheckerService {
    public static List<(string type, string content, int? oldLine, int? newLine)>
        DiffLines(string oldText, string newText) {
        var oldLines = oldText.Split('\n');
        var newLines = newText.Split('\n');

        int m = oldLines.Length;
        int n = newLines.Length;

        var lcs = new int[m + 1, n + 1];

        for (int i = m - 1; i >= 0; i--)
            for (int j = n - 1; j >= 0; j--)
                lcs[i, j] = oldLines[i] == newLines[j] ? lcs[i + 1, j + 1] + 1 : Math.Max(lcs[i + 1, j], lcs[i, j + 1]);

        var result = new List<(string, string, int?, int?)>();
        int oi = 0, ni = 0;
        int oldLineNo = 1, newLineNo = 1;

        while (oi < m && ni < n) {
            if (oldLines[oi] == newLines[ni]) {
                result.Add(("same", oldLines[oi], oldLineNo++, newLineNo++));
                oi++; ni++;
            } else if (lcs[oi + 1, ni] >= lcs[oi, ni + 1]) {
                result.Add(("remove", oldLines[oi], oldLineNo++, null));
                oi++;
            } else {
                result.Add(("add", newLines[ni], null, newLineNo++));
                ni++;
            }
        }

        while (oi < m) result.Add(("remove", oldLines[oi++], oldLineNo++, null));

        while (ni < n) result.Add(("add", newLines[ni++], null, newLineNo++));

        return result;
    }
}
