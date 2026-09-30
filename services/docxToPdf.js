import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const convertDocxToPdf = async (docxBuffer) => {
    const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'reportflow-pdf-'));
    const docxPath = path.join(temporaryDirectory, 'rapport-unifie.docx');
    const pdfPath = path.join(temporaryDirectory, 'rapport-unifie.pdf');
    const libreOfficeBinary = process.env.LIBREOFFICE_PATH || 'soffice';

    try {
        await fs.writeFile(docxPath, docxBuffer);
        await execFileAsync(libreOfficeBinary, [
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', temporaryDirectory,
            docxPath,
        ], { timeout: 120000 });
        return await fs.readFile(pdfPath);
    } catch (error) {
        const conversionError = new Error('La conversion PDF est indisponible sur le serveur. Vérifiez que le backend Render utilise le Dockerfile ReportflowBack.');
        conversionError.cause = error;
        conversionError.status = 503;
        throw conversionError;
    } finally {
        await fs.rm(temporaryDirectory, { recursive: true, force: true });
    }
};