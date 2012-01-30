function testArrayRemoveAll()
{
  assertArrayEquals ('ArrayRemoveAll 1', [], [].removeAll());
  assertArrayEquals ('ArrayRemoveAll 2', [], [1].removeAll());
  assertArrayEquals ('ArrayRemoveAll 3', [], [1,2].removeAll());
}

function testArrayRemove()
{
  assertArrayEquals ('ArrayRemove 1', ['1','2'], ['1','2','3'].remove(2));
  assertArrayEquals ('ArrayRemove 2', ['1','3'], ['1','2','3'].remove(1));
  assertArrayEquals ('ArrayRemove 3', ['2','3'], ['1','2','3'].remove(0));

  assertArrayEquals ('ArrayRemove 4', ['1','2'], ['1','2','3'].remove('3'));
  assertArrayEquals ('ArrayRemove 5', ['1','3'], ['1','2','3'].remove('2'));
  assertArrayEquals ('ArrayRemove 6', ['2','3'], ['1','2','3'].remove('1'));

  assertArrayEquals ('ArrayRemove 7', ['1'], ['1','2','3','4'].remove(1,3));
  assertArrayEquals ('ArrayRemove 8', ['3','4'], ['1','2','3','4'].remove(0,1));
  assertArrayEquals ('ArrayRemove 9', [], ['1','2','3','4'].remove(0,3));
}

function testArrayFindItem()
{
  var node = document.createElement ('div')
  var a = [0,1,2];
  var b = [0,1,2];
  
  assertEquals ('testArrayFindItem 1', 1, ['1','2','3','4'].findItem('2'));
  assertEquals ('testArrayFindItem 2',  -1, ['1','2','3','4'].findItem(2));
  assertEquals ('testArrayFindItem 3',  -1, ['1','2','3','4'].findItem('5'));
  assertEquals ('testArrayFindItem 4',  3, ['1', a, b, node,'4'].findItem(node));
  assertEquals ('testArrayFindItem 5',  -1, ['1', a,'4'].findItem(b));
}

function testArray_FindItem()
{
  var node = document.createElement ('div')
  var a = [0,1,2];
  var b = [0,1,2];
  
  assertEquals ('testArrayFindItem 1', 1, vs.util._findItem.call(['1','2','3','4'], '2'));
  assertEquals ('testArrayFindItem 2',  -1, vs.util._findItem.call(['1','2','3','4'], 2));
  assertEquals ('testArrayFindItem 3',  -1, vs.util._findItem.call(['1','2','3','4'], '5'));
  assertEquals ('testArrayFindItem 4',  3, vs.util._findItem.call(['1', a, b, node,'4'],node));
  assertEquals ('testArrayFindItem 5',  -1, vs.util._findItem.call(['1', a,'4'],b));
}

function testArrayClone ()
{
  assertArrayEquals ('ArrayClone 1',[], [].clone());
  assertArrayEquals ('ArrayClone 2',[1], [1].clone());
  assertArrayEquals ('ArrayClone 3',[1,2], [1,2].clone());
  assertArrayEquals ('ArrayClone 4',[0,1,2], [0,1,2].clone());
  var a = [0,1,2];
  var b = a;
  assertEquals ('ArrayClone 5', a, b);
  b = a.clone();
  assertNotEquals ('ArrayClone 6', a, b);
}