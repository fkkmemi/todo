<template>
  <v-layout>
    <v-flex xs12>
      <v-list two-line>
        <template v-for="(td, i) in todos">
          <v-list-tile
              :key="td.title"
              avatar
              @click=""
          >
            <v-list-tile-avatar>
              <v-icon :color="td.done ? 'success' : 'secondary'">{{td.done ? 'check' : 'hourglass_empty'}}</v-icon>
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>
                <v-icon>
                  {{types[td.type].icon}}
                </v-icon>
                <span>
                  {{td.title}}
                </span>
                <small class="text--primary">
                  기한: {{fromNow(td.t)}}
                </small>
              </v-list-tile-title>
              <v-list-tile-sub-title>
                <span>
                  {{td.content}}
                </span>
                <small class="text--primary">
                  작성: {{fromNow(td.rt)}}
                </small>
              </v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn icon ripple>
                <v-icon color="grey lighten-1">info</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>

        </template>
      </v-list>
    </v-flex>
    <v-btn
        color="primary"
        dark
        fab
        fixed
        bottom
        right
        @click="openDialog"
    >
      <v-icon>edit</v-icon>
    </v-btn>

    <v-dialog
        v-model="dialog"
        width="500"
    >

      <v-card>
        <v-card-title>
          <span class="headline">할일 작성</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field label="제목" required counter="40" prepend-icon="title" v-model="form.title"></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field label="내용" hint="굳이 넣고 싶다면.." counter="40" prepend-icon="note" v-model="form.content"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-menu
                      ref="menuDate"
                      :close-on-content-click="false"
                      v-model="menuDate"
                      :nudge-right="40"
                      :return-value.sync="date"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                      min-width="290px"
                  >
                    <v-text-field
                        slot="activator"
                        v-model="date"
                        label="목표 날짜"
                        prepend-icon="event"
                        readonly
                    ></v-text-field>
                    <v-date-picker
                        v-model="date"
                        locale="ko"
                        @input="$refs.menuDate.save(date)"
                    ></v-date-picker>
                  </v-menu>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-menu
                      ref="menuTime"
                      :close-on-content-click="false"
                      v-model="menuTime"
                      :nudge-right="40"
                      :return-value.sync="time"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                      max-width="290px"
                      min-width="290px"
                  >
                    <v-text-field
                        slot="activator"
                        v-model="time"
                        label="목표 시간"
                        prepend-icon="access_time"
                        readonly
                    ></v-text-field>
                    <v-time-picker
                        v-if="menuTime"
                        v-model="time"
                        locale="ko"
                        @change="$refs.menuTime.save(time)"
                    ></v-time-picker>
                  </v-menu>
                </v-flex>

                <v-flex xs12 sm6>
                  <v-select
                      :items="types"
                      label="종류"
                      v-model="form.type"
                      item-text="text"
                      item-value="value"
                      prepend-icon="map"
                      required
                  ></v-select>
                </v-flex>

              </v-layout>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click.native="dialog = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click.native="save()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
        :timeout="snackbar.timeOut"
        v-model="snackbar.act"
        :color="snackbar.color"
    >
      {{ snackbar.text }}
      <v-spacer></v-spacer>
      <v-btn flat color="white" @click.native="snackbar.act = false">닫기</v-btn>
    </v-snackbar>
  </v-layout>
</template>

<script>
  export default {
    name: 'welcome',
    data () {
      return {
        todos: [],
        form: {
          rt: new Date(),
          t: new Date(),
          type: 0,
          title: '',
          content: '',
          done: false
        },
        menuDate: false,
        menuTime: false,
        date: null,
        time: null,
        valid: false,
        dialog: false,
        types: [
          { value: 0, text: '집', icon: 'home' },
          { value: 1, text: '회사', icon: 'store' },
          { value: 2, text: '밖', icon: 'timeline' }
        ],
        snackbar: {
          act: false,
          text: '',
          color: 'success',
          timeOut: 5000
        }
      }
    },
    computed: {
      dt2date () {
        if (!this.date || !this.time) return null
        return this.$moment(this.date + ' ' + this.time).toDate()
      }
    },
    methods: {
      pop (msg, cl, t) {
        this.snackbar.act = true
        this.snackbar.text = msg
        this.snackbar.color = cl
        this.snackbar.timeOut = t
      },
      save () {
        this.dialog = false
        const td = {
          rt: new Date(),
          t: this.dt2date,
          type: this.form.type,
          title: this.form.title,
          content: this.form.content,
          done: false
        }
        this.todos.push(td)
        this.pop('잘 등록 되었습니다.', 'success', 5000)
      },
      fromNow (rt) {
        return this.$moment(rt).fromNow()
      },
      openDialog () {
        this.$refs.form.reset()
        this.dialog = true
      }
    }
  }
</script>

<style scoped>
</style>
