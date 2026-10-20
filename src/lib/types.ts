export type Member = {
  id: string;
  name: string;
  phone: string;
};

export type Committee = {
  id: string;
  name: string;
  /** Contribution each member pays every month. */
  monthlyAmount: number;
  /** First month of the committee, as "YYYY-MM". */
  startMonth: string;
  /** Day of the month contributions are due. */
  dueDay: number;
  /** Members in payout order: members[i] receives the pot in round i. */
  members: Member[];
  /** Key `${round}:${memberId}` → ISO date the contribution was received. */
  payments: Record<string, string>;
  /** Key round → ISO date the pot was handed over. */
  payouts: Record<string, string>;
  createdAt: string;
};

export type AppState = {
  committees: Committee[];
  currency: string;
};
