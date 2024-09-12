<script>

    const assignments = [
      {"id":1,"title":"Hello","assignment_order":1,"handout":"Write a function \"hello\" that returns the string \"Hello\"","test_code":"import socket\ndef guard(*args, **kwargs):\n  raise Exception(\"Internet is bad for you :|\")\nsocket.socket = guard\n\nimport unittest\nfrom code import *\n\nclass TestHello(unittest.TestCase):\n\n  def test_hello(self):\n    self.assertEqual(hello(), \"Hello\", \"Function should return \\\"Hello\\\"\")\n"},
      {"id":2,"title":"Hello world","assignment_order":2,"handout":"Write a function \"hello\" that returns the string \"Hello world!\"","test_code":"import socket\ndef guard(*args, **kwargs):\n  raise Exception(\"Internet is bad for you :|\")\nsocket.socket = guard\n\nimport unittest\nfrom code import *\n\nclass TestHello(unittest.TestCase):\n\n  def test_hello(self):\n    self.assertEqual(hello(), \"Hello world!\", \"Function should return \\\"Hello world!\\\"\")\n"},
      {"id":3,"title":"Sum","assignment_order":3,"handout":"Write a function \"sum\" that takes two numbers as parameters and returns their sum.","test_code":"import socket\ndef guard(*args, **kwargs):\n  raise Exception(\"Internet is bad for you :|\")\nsocket.socket = guard\n\nimport unittest\nfrom code import *\n\nclass TestHello(unittest.TestCase):\n\n  def test_sum_1(self):\n    self.assertEqual(sum(2, 4), 6, \"Call sum(2, 4) should return 6.\")\n\n  def test_sum_2(self):\n    self.assertEqual(sum(40, 2), 42, \"Call sum(40, 2) should return 42.\")\n"}]
    import AssignmentSelector from "./AssignmentSelector.svelte";



</script>

<AssignmentSelector {assignments} />
