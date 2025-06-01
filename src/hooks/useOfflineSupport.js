import { useState, useEffect, useCallback } from 'react';
import { concertService } from '../api/api';

/**
 * Custom hook for handling offline functionality
 * @param {string} storageKey - Key for storing offline operations in localStorage
 * @returns {Object} - Methods and state for offline functionality
 */
export function useOfflineSupport(storageKey = 'offlineOperations') {
    // Network status state
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isServerAvailable, setIsServerAvailable] = useState(true);
    const [pendingOperations, setPendingOperations] = useState([]);

    // Initialize pending operations from localStorage
    useEffect(() => {
        const storedOperations = localStorage.getItem(storageKey);
        if (storedOperations) {
            setPendingOperations(JSON.parse(storedOperations));
        }
    }, [storageKey]);

    // Update pending operations in localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(pendingOperations));
    }, [pendingOperations, storageKey]);

    // Set up event listeners for online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Server health check function
    const checkServerAvailability = useCallback(async () => {
        if (!navigator.onLine) {
            setIsServerAvailable(false);
            return false;
        }

        try {
            const response = await fetch('/api/concerts/health', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                // Short timeout to detect server issues quickly
                signal: AbortSignal.timeout(3000)
            });

            const available = response.ok;
            setIsServerAvailable(available);
            return available;
        } catch (error) {
            console.error('Server health check failed:', error);
            setIsServerAvailable(false);
            return false;
        }
    }, []);

    // Periodically check server availability
    useEffect(() => {
        // Only check if we're online
        if (!navigator.onLine) {
            setIsServerAvailable(false);
            return;
        }

        // Initial check
        checkServerAvailability();

        // Set up interval for checks
        const intervalId = setInterval(checkServerAvailability, 30000); // Check every 30 seconds

        return () => clearInterval(intervalId);
    }, [checkServerAvailability, isOnline]);

    // Add an operation to the queue for later syncing
    const addOfflineOperation = useCallback((operation) => {
        setPendingOperations(prev => [...prev, operation]);
    }, []);

    // Sync pending operations with server
    const syncWithServer = useCallback(async () => {
        if (!isOnline || !isServerAvailable || pendingOperations.length === 0) {
            return;
        }

        const ops = [...pendingOperations];
        const successfulOps = [];
        const failedOps = [];

        // First try bulk sync if supported by API
        try {
            const bulkResponse = await concertService.bulkSync(ops);

            // Process results from bulk operation
            if (bulkResponse && bulkResponse.results) {
                bulkResponse.results.forEach((result, index) => {
                    if (result.success) {
                        successfulOps.push(ops[index]);
                    } else {
                        failedOps.push(ops[index]);
                    }
                });
            } else {
                // If bulk sync didn't respond as expected, consider all failed
                failedOps.push(...ops);
            }
        } catch (error) {
            console.error('Bulk sync failed, falling back to individual operations:', error);

            // Fall back to individual operations
            for (const op of ops) {
                try {
                    switch (op.type) {
                        case 'create':
                            await concertService.create(op.data);
                            successfulOps.push(op);
                            break;
                        case 'update':
                            await concertService.update(op.id, op.data);
                            successfulOps.push(op);
                            break;
                        case 'delete':
                            await concertService.delete(op.id);
                            successfulOps.push(op);
                            break;
                        default:
                            failedOps.push(op);
                    }
                } catch (opError) {
                    console.error(`Failed to sync operation:`, op, opError);
                    failedOps.push(op);
                }
            }
        }

        // Remove successful operations from pending list
        if (successfulOps.length > 0) {
            setPendingOperations(prev =>
                prev.filter(op => !successfulOps.some(
                    successOp => (op.id === successOp.id && op.type === successOp.type) ||
                        (op.tempId && op.tempId === successOp.tempId)
                ))
            );
        }

        // If some operations failed, keep them for retry
        if (failedOps.length > 0) {
            console.warn(`${failedOps.length} operations failed to sync and will be retried`);
        }

        return {
            success: successfulOps.length,
            failed: failedOps.length
        };
    }, [isOnline, isServerAvailable, pendingOperations]);

    return {
        isOnline,
        isServerAvailable,
        pendingOperations,
        addOfflineOperation,
        syncWithServer,
        checkServerAvailability
    };
}