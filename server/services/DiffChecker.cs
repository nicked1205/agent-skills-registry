using server.dtos;

namespace server.services;

public static class DiffCheckerService {
    public static List<DiffLineDto> DiffLines(string oldText, string newText) {
        var oldLines = oldText.Split('\n');
        var newLines = newText.Split('\n');

        int m = oldLines.Length;
        int n = newLines.Length;

        var lcs = new int[m + 1, n + 1];

        for (int i = m - 1; i >= 0; i--)
            for (int j = n - 1; j >= 0; j--)
                lcs[i, j] = oldLines[i] == newLines[j] ? lcs[i + 1, j + 1] + 1 : Math.Max(lcs[i + 1, j], lcs[i, j + 1]);

        var result = new List<DiffLineDto>();
        int oi = 0, ni = 0;
        int oldLineNo = 1, newLineNo = 1;

        while (oi < m && ni < n) {
            if (oldLines[oi] == newLines[ni]) {
                result.Add(new DiffLineDto(
                    "same", 
                    oldLines[oi], 
                    oldLineNo++, 
                    newLineNo++, 
                    null));
                oi++; ni++;
            } else if (lcs[oi + 1, ni] >= lcs[oi, ni + 1]) {
                result.Add(new DiffLineDto(
                    "remove", 
                    oldLines[oi], 
                    oldLineNo++, 
                    null, 
                    null));
                oi++;
            } else if (lcs[oi + 1, ni + 1] >= lcs[oi + 1, ni] &&
                lcs[oi + 1, ni + 1] >= lcs[oi, ni + 1]) {
                var words = DiffWords(oldLines[oi], newLines[ni]);

                result.Add(new DiffLineDto(
                    "modify",
                    newLines[ni],
                    oldLineNo++,
                    newLineNo++,
                    words
                ));

                oi++; ni++;
            } else {
                result.Add(new DiffLineDto(
                    "add", 
                    newLines[ni], 
                    null, 
                    newLineNo++, 
                    null));
                ni++;
            }
        }

        while (oi < m) result.Add(new DiffLineDto("remove", oldLines[oi++], oldLineNo++, null, null));

        while (ni < n) result.Add(new DiffLineDto("add", newLines[ni++], null, newLineNo++, null));

        return result;
    }

    private static List<DiffWordDto> DiffWords(
        string oldLine,
        string newLine) {
        var oldWords = oldLine.Split(' ');
        var newWords = newLine.Split(' ');

        int m = oldWords.Length;
        int n = newWords.Length;

        var lcs = new int[m + 1, n + 1];

        for (int i = m - 1; i >= 0; i--)
            for (int j = n - 1; j >= 0; j--)
                lcs[i, j] = oldWords[i] == newWords[j] ? lcs[i + 1, j + 1] + 1 : Math.Max(lcs[i + 1, j], lcs[i, j + 1]);

        var result = new List<DiffWordDto>();
        int oi = 0, ni = 0;

        while (oi < m && ni < n) {
            if (oldWords[oi] == newWords[ni]) {
                result.Add(new DiffWordDto("same", oldWords[oi]));
                oi++; ni++;
            } else if (lcs[oi + 1, ni] >= lcs[oi, ni + 1]) {
                result.Add(new DiffWordDto("remove", oldWords[oi++]));
            } else {
                result.Add(new DiffWordDto("add", newWords[ni++]));
            }
        }

        while (oi < m) result.Add(new DiffWordDto("remove", oldWords[oi++]));
        while (ni < n) result.Add(new DiffWordDto("add", newWords[ni++]));

        return result;
    }
}
