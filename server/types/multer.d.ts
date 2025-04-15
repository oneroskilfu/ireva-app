declare module 'multer' {
  import { Request } from 'express';
  
  namespace multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
    
    interface Options {
      dest?: string;
      storage?: any;
      fileFilter?: (req: Request, file: File, callback: (error: Error | null, acceptFile: boolean) => void) => void;
      limits?: {
        fieldNameSize?: number;
        fieldSize?: number;
        fields?: number;
        fileSize?: number;
        files?: number;
        parts?: number;
        headerPairs?: number;
      };
    }
  }
  
  function multer(options?: multer.Options): any;
  
  export = multer;
}

// Express extensions
declare global {
  namespace Express {
    interface Request {
      file?: multer.File;
      files?: {
        [fieldname: string]: multer.File[];
      } | multer.File[];
    }
    
    interface Multer {
      single(fieldname: string): any;
      array(fieldname: string, maxCount?: number): any;
      fields(fields: Array<{name: string, maxCount?: number}>): any;
      none(): any;
    }
  }
}