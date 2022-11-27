import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";

const Stores: NextPage = () => {
  const { data: sessionData } = useSession();

  const [name, setName] = useState("");
  const [take, setTake] = useState(10);
  const [search, setSearch] = useState("");

  const utils = trpc.useContext();
  const stores = trpc.store.getAll.useQuery({ take: take, search: search });
  const mutation = trpc.store.create.useMutation({
    async onMutate(newData) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.store.getAll.cancel();

      // Get the data from the queryCache
      const prevData = utils.store.getAll.getData();

      // Optimistically update the data with our new store
      utils.store.getAll.setData(
        { take: take, search: search },
        (prevData: any) => [...prevData, newData]
      );

      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    onError(err, newPost, ctx) {
      // If the mutation fails, use the context-value from onMutate
      utils.store.getAll.setData({ take: take, search: search }, ctx?.prevData);
    },
    onSettled() {
      // Sync with server once mutation has settled
      utils.store.getAll.invalidate();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutateAsync({
      name: name,
      userId: sessionData?.user?.id,
    });
  };
  return (
    <>
      <span>Stores</span>
      {JSON.stringify(stores)}
      <select
        name="take"
        id="take"
        onChange={(e) => setTake(+e.target.value)}
        defaultValue={take}
      >
        <option value="2">2</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="100">100</option>
      </select>
      <input
        type="text"
        name="search"
        id="search"
        onChange={(e) => setSearch(e.target.value)}
      />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          id="name"
          onChange={(e) => setName(e.target.value)}
          className="border border-black p-2"
        />
        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default Stores;
