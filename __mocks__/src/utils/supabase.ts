// File: __mocks__/src/utils/supabase.ts

const mockEqual: any = jest.fn(() => ({ eq: mockEqual, single: mockSingle, select: mockSelect }));
const mockSingle = jest.fn();
const mockSelect = jest.fn(() => ({ eq: mockEqual, single: mockSingle }));
const mockInsert = jest.fn(() => ({ select: mockSelect }));
const mockUpdate = jest.fn(() => ({ eq: mockEqual }));
const mockFrom = jest.fn(() => ({
  insert: mockInsert,
  update: mockUpdate,
  select: mockSelect,
  eq: mockEqual
  
}));

const supabase = {
  from: mockFrom,
  mockFrom,
  mockInsert,
  mockUpdate,
  mockSelect,
  mockSingle,
  mockEqual
};

export default supabase;


//  const { data: client, error: clientError } = await supabase
//     .from('clients')
//     .select('*')
//     .eq('id', clientId)
//     .eq('user_id', userId)
//     .single();