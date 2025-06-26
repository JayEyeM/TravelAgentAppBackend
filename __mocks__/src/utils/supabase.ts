// File: __mocks__/src/utils/supabase.ts

const mockEqual: any = jest.fn(() => ({ eq: mockEqual, select: mockSelect }));
const mockSingle = jest.fn();
const mockSelect = jest.fn(() => ({ single: mockSingle }));
const mockInsert = jest.fn(() => ({ select: mockSelect }));
const mockUpdate = jest.fn(() => ({ eq: mockEqual }));
const mockFrom = jest.fn(() => ({
  insert: mockInsert,
  update: mockUpdate,
  select: mockSelect,
}));

const supabase = {
  from: mockFrom,
  mockFrom,
  mockInsert,
  mockSelect,
  mockSingle,
};

export default supabase;


// const { data, error } = await supabase
//     .from('clients')
//     .update(formattedClient)
//     .eq('id', clientId)
//     .eq('user_id', userId)
//     .select()
//     .single();