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
              <v-icon color="info">{{types[td.type].icon}}</v-icon>
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>
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
              <v-btn icon ripple @click="dbUpdate(td)">
                <v-icon :color="td.done ? 'success' : 'secondary'">check</v-icon>
              </v-btn>
              <v-btn icon ripple @click="dbDelete(td._id)">
                <v-icon color="error">delete</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>

        </template>
      </v-list>
    </v-flex>
    <v-btn
        color="pink"
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
          <v-btn color="blue darken-1" flat @click.native="dialog = false">취소</v-btn>
          <v-btn color="blue darken-1" flat @click.native="dbCreate()">저장</v-btn>
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
    mounted () {
      this.dbRead()
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
      fromNow (rt) {
        return this.$moment(rt).fromNow()
      },
      openDialog () {
        this.$refs.form.reset()
        this.dialog = true
      },
      dbCreate () {
        this.dialog = false
        const td = {
          rt: new Date(),
          t: this.dt2date,
          type: this.form.type,
          title: this.form.title,
          content: this.form.content,
          done: false
        }
        if (!this.$refs.form.validate()) return this.pop('값이 유효하지 않습니다', 'error', 60000)
        this.$db.insert(td, (err) => {
          if (err) return this.pop(err.message, 'error', 60000)
          this.dbRead()
          this.pop('저장 성공', 'success', 5000)
        })
      },
      dbRead () {
        this.$db.find({}, (err, rs) => {
          if (err) return this.pop(err.message, 'error', 60000)
          this.todos = rs
        })
      },
      dbUpdate (td) {
        this.$db.update({ _id: td._id }, { $set: { done: !td.done } }, (err) => {
          if (err) return this.pop(err.message, 'error', 60000)
          this.dbRead()
        })
      },
      dbDelete (_id) {
        this.$db.remove({ _id }, (err) => {
          if (err) return this.pop(err.message, 'error', 60000)
          this.dbRead()
          this.pop('삭제 성공', 'success', 5000)
        })
      }
    }
  }
</script>

<style scoped>
</style>
