import { Fontisto, Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./color";

const STORAGE_KEY = "@toDos";
const MODE_KEY = "@mode";

export default function App() {
  const [mode, setMode] = useState("work");
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [edit, setEdit] = useState("");
  const [editText, setEditText] = useState("");

  useEffect(() => {
    getMode();
    getToDos();
  }, []);

  const setModeTravel = () => {
    setMode("travel");
    saveMode("travel");
  };
  const setModeWork = () => {
    setMode("work");
    saveMode("work");
  };
  const onChangeText = (payload) => setText(payload);
  const onChangeEditText = (payload) => setEditText(payload);
  const onEdit = (key) => {
    if (key === edit) {
      setEdit("");
    } else {
      setEdit(key);
    }
  };
  const saveMode = async (mode) => {
    try {
      await AsyncStorage.setItem(MODE_KEY, mode);
    } catch (error) {
      console.log(error);
    }
  };
  const getMode = async () => {
    try {
      const mode = await AsyncStorage.getItem(MODE_KEY);
      setMode(mode);
    } catch (error) {
      console.log(error);
    }
  };
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.log(error);
    }
  };
  const getToDos = async () => {
    const toDosJSON = await AsyncStorage.getItem(STORAGE_KEY);
    if (!toDosJSON) {
      setToDos({});
    } else {
      setToDos(JSON.parse(toDosJSON));
    }
  };
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = Object.assign({}, toDos, {
      [Date.now()]: { text, mode, check: false },
    });
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const editToDo = async (key) => {
    if (editText === "") {
      return;
    }
    const newToDos = Object.assign({}, toDos);
    newToDos[key].text = editText;
    setEdit("");
    setToDos(newToDos);
    await saveToDos(newToDos);
    setEditText("");
  };
  const deleteToDo = (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "cancel" },
      {
        text: "delete",
        style: "destructive",
        onPress: async () => {
          const newToDos = Object.assign({}, toDos);
          delete newToDos[key];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
  };
  const checkToDo = async (key) => {
    const newToDos = Object.assign({}, toDos);
    newToDos[key].check = true;
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={setModeWork}>
          <Text
            style={{
              ...styles.btnText,
              color: mode === "work" ? "white" : theme.gray,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={setModeTravel}>
          <Text
            style={{
              ...styles.btnText,
              color: mode === "travel" ? "white" : theme.gray,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={
          mode === "work" ? "Add a To Do" : "Where do you want to go?"
        }
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].mode === mode ? (
            <View style={styles.toDo} key={key}>
              {key === edit ? (
                <TextInput
                  onSubmitEditing={() => editToDo(key)}
                  onChangeText={onChangeEditText}
                  returnKeyType="done"
                  value={editText}
                  defaultValue={toDos[key].text}
                  style={styles.input}
                />
              ) : (
                <Text
                  style={
                    toDos[key].check
                      ? { ...styles.toDoText, ...styles.checkToDoText }
                      : styles.toDoText
                  }
                >
                  {toDos[key].text}
                </Text>
              )}
              <View style={styles.toDoIcons}>
                {!toDos[key].check && (
                  <>
                    <TouchableOpacity
                      onPress={() => checkToDo(key)}
                      style={{ marginRight: 10 }}
                    >
                      <Fontisto name="check" size={18} color="red" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onEdit(key)}
                      style={{ marginRight: 10 }}
                    >
                      <Feather name="edit" size={24} color="green" />
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={18} color={theme.gray} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 100,
    paddingHorizontal: 20,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: theme.toDoBackground,
  },
  toDoIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  checkToDoText: {
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    opacity: 0.5,
  },
});
