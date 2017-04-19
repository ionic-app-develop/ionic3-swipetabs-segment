import { BuildContext, ChangedFile, DeepLinkConfigEntry } from './util/interfaces';
export declare function deepLinking(context: BuildContext): Promise<void>;
export declare function deepLinkingWorkerImpl(context: BuildContext, changedFiles: ChangedFile[]): Promise<DeepLinkConfigEntry[]>;
export declare function deepLinkingUpdate(changedFiles: ChangedFile[], context: BuildContext): Promise<void>;
export declare function deepLinkingUpdateImpl(changedFiles: ChangedFile[], context: BuildContext): Promise<void>;
export declare function deepLinkingWorkerFullUpdate(context: BuildContext): Promise<void>;
