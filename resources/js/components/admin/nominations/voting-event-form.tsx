import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Club, VotingEvent } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { ethers } from 'ethers';
import contractABI from './ClubVoting.abi.json';

interface VotingEventFormProps {
    votingEvent?: VotingEvent;
    clubs: Club[];
    onSuccess?: () => void;
    candidatesList: any[];
}

const votingEventFormSchema = z
    .object({
        club_id: z.string().min(1, 'Club is required'),
        title: z.string().min(3, 'Event title must be at least 3 characters'),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        status: z.enum(['active', 'draft', 'closed', 'archived']),
        start_date: z.string().min(1, 'Start date and time is required'),
        end_date: z.string().min(1, 'End date and time is required'),
    })
    .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
        message: 'End date must be after start date',
        path: ['end_date'],
    });

type VotingEventFormValues = z.infer<typeof votingEventFormSchema>;

// Vite exposes env variables via import.meta.env.VITE_*
const CONTRACT_ADDRESS = '0xb0fFa4201846969F5B5180aa3ECCBCBc8BBf875C';
const RPC_URL = import.meta.env.VITE_BLOCKCHAIN_RPC_URL || 'https://testnet.skalenodes.com/v1/giant-half-dual-testnet';
const PRIVATE_KEY = import.meta.env.VITE_BLOCKCHAIN_PRIVATE_KEY;
const WALLET_ADDRESS = import.meta.env.VITE_BLOCKCHAIN_WALLET_ADDRESS;


interface createVotingEventOnBlockchainProps {
  clubId: number;
  title: string;
  description: string;
  startDate: number;
  endDate: number;
  positions: {
    id: number;
    name: string;
    candidates: {
        id: number;
        name: string;
    }[]
  }[];
}


async function createVotingEventOnBlockchain({
  clubId,
  title,
  description,
  startDate,
  endDate,
  positions,
}: createVotingEventOnBlockchainProps
) {
  try {
    console.log('Connecting to SKALE RPC:', RPC_URL);
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    if (!PRIVATE_KEY) {
      throw new Error('Blockchain private key is not set in environment variables.');
    }
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

    // Prepare data for contract
    const positionNames = positions.map((p) => p.name);
    const candidateNames = positions.map((p) => p.candidates.map((c) => c.name));

    console.log('Prepared data:', {
      clubId,
      title,
      description,
      startDate,
      endDate,
      positionNames,
      candidateNames,
    });

    const tx = await contract.createVotingEvent(
      clubId,
      title,
      description,
      startDate,
      endDate,
      positionNames,
      candidateNames
    );
    console.log('Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.transactionHash);

    // Debug: Print positions and candidates count for the new event
    try {
      const eventId = await contract.nextEventId() - 1n;
      const positionsCount = await contract.getPositionsCount(eventId);
      console.log('Positions count for new event:', positionsCount.toString());
      for (let i = 0; i < Number(positionsCount); i++) {
        const candidatesCount = await contract.getCandidatesCount(eventId, i);
        console.log(`Candidates count for position ${i}:`, candidatesCount.toString());
      }
    } catch (err) {
      console.warn('Could not fetch positions/candidates count after event creation:', err);
    }

    return receipt;
  } catch (error) {
    console.error('Blockchain voting event creation failed:', error);
    throw error;
  }
}

export default function VotingEventForm({ votingEvent, clubs, candidatesList, onSuccess }: VotingEventFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEdit = !!votingEvent;
    // const [candidateIDs, setCandidateIDs] = useState<number[] | null>();

    // useEffect(() => {
    //     const ids = candidatesList.map((candidate) => candidate.user_id);
    //     setCandidateIDs(ids);
    // }, [candidatesList]);

console.log(candidatesList);

    const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "yyyy-MM-dd'T'HH:mm");
    };

    const form = useForm<VotingEventFormValues>({
        resolver: zodResolver(votingEventFormSchema),
        defaultValues: votingEvent
            ? {
                  club_id: votingEvent.club_id.toString(),
                  title: votingEvent.title,
                  description: votingEvent.description ?? '',
                  status: votingEvent.status,
                  start_date: formatDateForInput(votingEvent.start_date),
                  end_date: formatDateForInput(votingEvent.end_date),
              }
            : {
                  club_id: '',
                  title: '',
                  description: '',
                  status: 'active',
                  start_date: '',
                  end_date: '',
              },
    });

    const handleSubmit = async (data: VotingEventFormValues) => {
        setIsSubmitting(true);

        if (isEdit) {
            router.put(route('admin.voting-events.update', votingEvent.id), data, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    onSuccess?.();
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    if (errors.error) {
                        toast.error(errors.error);
                    }
                    Object.entries(errors).forEach(([key, value]) => {
                        form.setError(key as keyof VotingEventFormValues, { message: value as string });
                    });
                },
            });
        } else {
            try {
                console.log('Club Data:', data);
                // 1. Find the selected club and its positions
                const club = clubs.find((c) => c.id === Number(data.club_id));
                if (!club || !club.positions) {
                    toast.error('Club or positions not found');
                    setIsSubmitting(false);
                    return;
                }

                // Group candidates by position
                const positionMap: Record<string, { id: number; name: string; candidates: { id: number; name: string }[] }> = {};
                candidatesList.forEach((candidate) => {
                    const posId = candidate.club_position.id;
                    const posName = candidate.club_position.name;
                    if (!positionMap[posId]) {
                        positionMap[posId] = { id: posId, name: posName, candidates: [] };
                    }
                    positionMap[posId].candidates.push({ id: candidate.user_id, name: candidate.user.name });
                });
                const positionsWithCandidates = Object.values(positionMap);

                // Debug: Print club.positions and positionsWithCandidates
                console.log('club.positions:', club.positions);
                positionsWithCandidates.forEach((pos, idx) => {
                    console.log(`Position ${idx} (${pos.name}) candidates:`, pos.candidates);
                });
                console.log('positionsWithCandidates:', positionsWithCandidates);

                // 3. Call blockchain with new contract signature
                const receipt = await createVotingEventOnBlockchain({
                    clubId: Number(data.club_id),
                    title: data.title,
                    description: data.description,
                    startDate: Math.floor(new Date(data.start_date).getTime() / 1000),
                    endDate: Math.floor(new Date(data.end_date).getTime() / 1000),
                    positions: positionsWithCandidates,
                });

                // Get blockchain eventId (from contract)
                let blockchainEventId: number | null = null;
                try {
                    // If your contract emits VotingEventCreated, parse logs for eventId
                    const event = receipt?.logs?.find((log: any) => log.topics && log.topics.length > 0);
                    if (event && event.topics && event.topics.length > 1) {
                        blockchainEventId = Number(BigInt(event.topics[1]));
                    } else {
                        // fallback: use nextEventId()-1n
                        const provider = new ethers.JsonRpcProvider(RPC_URL);
                        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
                        blockchainEventId = Number((await contract.nextEventId()) - 1n);
                    }
                } catch (err) {
                    console.warn('Could not determine blockchain eventId:', err);
                }
                if (!blockchainEventId) {
                    toast.error('Could not determine blockchain eventId from blockchain');
                    setIsSubmitting(false);
                    return;
                }

                // 4. Continue with backend call, pass blockchain_event_id
                router.post(route('admin.voting-events.store'), { ...data, blockchain_event_id: blockchainEventId }, {
                    onSuccess: () => {
                        setIsSubmitting(false);
                        onSuccess?.();
                    },
                    onError: (errors) => {
                        setIsSubmitting(false);
                        if (errors.error) {
                            toast.error(errors.error);
                        }
                        Object.entries(errors).forEach(([key, value]) => {
                            form.setError(key as keyof VotingEventFormValues, { message: value as string });
                        });
                    },
                });
            } catch (error) {
                toast.error('Blockchain voting event creation failed');
                setIsSubmitting(false);
            }
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Club */}
                <FormField
                    control={form.control}
                    name="club_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Club</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Club" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {clubs.map((club) => (
                                        <SelectItem key={club.id} value={club.id.toString()}>
                                            {club.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Title */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter event title" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Enter event description" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Status */}
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Start Date */}
                    <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Date & Time</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* End Date */}
                    <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Date & Time</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEdit ? 'Updating...' : 'Creating...'}
                            </>
                        ) : isEdit ? (
                            'Update Event'
                        ) : (
                            'Create Event'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
